import {ChainId} from '@layerzerolabs/lz-sdk';
import {waitForMessageReceived} from '@layerzerolabs/scan-client';
import {
  OnftBridgeApi,
  OnftBridgeConfig,
  OnftContract,
  OnftInflightTransaction,
  OnftStandard,
  OnftToken,
  OnftTokenAmount,
  OnftTransferInput,
} from '@layerzerolabs/ui-bridge-onft';
import {
  AdapterParams,
  Currency,
  CurrencyAmount,
  FeeQuote,
  getExpectedDate,
  getNativeCurrency,
  getScanLink,
  isEvmChainId,
  tryParseCurrencyAmount,
} from '@layerzerolabs/ui-core';
import {assertWallet, Wallet} from '@layerzerolabs/ui-wallet';
import assert from 'assert';
import {isEqual, uniqBy, without} from 'lodash-es';
import {autorun, flow, makeAutoObservable, ObservableMap} from 'mobx';
import {fromPromise} from 'mobx-utils';
import {toast} from 'react-toastify';

import {airdropStore} from '@/core/stores/airdropStore';
import {balanceStore} from '@/core/stores/balanceStore';
import {lzConfigStore} from '@/core/stores/lzStore';
import {transactionStore} from '@/core/stores/transactionStore';
import {getWalletBalance} from '@/core/stores/utils';
import {walletStore} from '@/core/stores/walletStore';
import {Toast} from '@/core/ui/Toast';
import {FromPromise, fromPromiseValue} from '@/core/utils/fromPromise';
import {handleError} from '@/core/utils/handleError';
import {parseWalletError} from '@/core/utils/parseWalletError';
import {timeStamp} from '@/core/utils/timeStamp';

import {isSameOnftContract, isSameOnftToken} from './utils';

type Collection = OnftBridgeConfig;

export enum DstNativeAmount {
  NONE = 'NONE',
  DEFAULT = 'DEFAULT',
  MAX = 'MAX',
}

export class FormItem {
  token: OnftToken;
  amount: number;
  constructor(args: {token: OnftToken; amount?: number}) {
    this.amount = args.amount ?? 1;
    this.token = args.token;
    makeAutoObservable(this, {}, {autoBind: true});
  }
  get maxAmount(): number | undefined {
    const {srcAddress} = onftStore;
    if (!srcAddress) return undefined;
    const assets = onftStore.balances.get(srcAddress);
    const asset = assets?.find((asset) => isSameOnftToken(asset.token, this.token));
    return asset?.amount;
  }
}

class FormModel {
  items: FormItem[] = [];
  dstChainId: ChainId | undefined = undefined;
  dstNativeAmount: string | DstNativeAmount = DstNativeAmount.DEFAULT;
  constructor() {
    makeAutoObservable(this, {}, {autoBind: true});
  }
  get amounts(): OnftTokenAmount[] {
    // just an alias
    return this.items.map((item) => ({
      amount: item.amount,
      token: item.token,
    }));
  }
}

class FiltersModel {
  chainId: ChainId | undefined = undefined;
  constructor() {
    makeAutoObservable(this, {}, {autoBind: true});
  }
  setChainId(chainId: ChainId | undefined): void {
    this.chainId = chainId;
  }
}

export interface ValidationError {
  error: string;
  field?: string;
}

type OnftPromise = {
  extraGas: FromPromise<number> | undefined;
  messageFee: FromPromise<FeeQuote> | undefined;
};

class OnftBridgeStore {
  filters = new FiltersModel();
  form = new FormModel();
  isExecuting = false;
  isApproving = false;
  isSigning = false;
  isMining = false;
  apis: OnftBridgeApi<unknown>[] = [];
  collections: Collection[] = [];
  // balances
  balances = new ObservableMap<string, OnftTokenAmount[]>();
  //
  inflight: OnftInflightTransaction[] = [];
  //
  promise: OnftPromise = {
    extraGas: undefined,
    messageFee: undefined,
  };

  constructor() {
    makeAutoObservable(this, {}, {autoBind: true});
  }

  get chains(): ChainId[] {
    return Array.from(new Set(this.collections.flatMap((c) => c.contracts.map((c) => c.chainId))));
  }
  get srcNftContract(): OnftContract | undefined {
    return this.form.items.at(0)?.token.contract;
  }
  get dstNftContract(): OnftContract | undefined {
    const {dstChainId, collection} = this;
    if (!dstChainId) return undefined;
    if (!collection) return undefined;
    return collection.contracts.find((c) => c.chainId === dstChainId);
  }
  get srcNftTokens(): OnftToken[] | undefined {
    return this.form.items.map((i) => i.token);
  }
  get collection(): Collection | undefined {
    const {srcNftContract} = this;
    if (!srcNftContract) return undefined;
    const collection = this.collections.find((c) =>
      c.contracts.some((c) => isSameOnftContract(c, srcNftContract)),
    );
    return collection;
  }
  get srcChainId(): ChainId | undefined {
    return this.srcNftContract?.chainId;
  }
  get dstChainId(): ChainId | undefined {
    return this.form.dstChainId;
  }
  get dstNetworkOptions(): NetworkSelectOption[] {
    const {srcChainId, collection} = this;
    // custom logic per app
    if (!srcChainId) return [];
    if (!collection) return [];
    const chains = collection.contracts.map((c) => c.chainId);
    return without(chains, srcChainId).map((chainId) => ({chainId}));
  }
  get srcWallet(): Wallet<unknown> | undefined {
    return walletStore.evm;
  }
  get dstWallet(): Wallet<unknown> | undefined {
    return walletStore.evm;
  }
  get srcAddress(): string | undefined {
    return this.srcWallet?.address;
  }
  get dstAddress(): string | undefined {
    return this.dstWallet?.address;
  }
  get srcNativeBalance(): CurrencyAmount | undefined {
    const {srcChainId} = this;
    if (!srcChainId) return undefined;
    const native = getNativeCurrency(srcChainId);
    return getWalletBalance(native);
  }
  get dstNativeBalance(): CurrencyAmount | undefined {
    const {dstChainId} = this;
    if (!dstChainId) return undefined;
    const native = getNativeCurrency(dstChainId);
    return getWalletBalance(native);
  }
  get api(): OnftBridgeApi<unknown> | undefined {
    const {srcNftContract: srcNft} = this;
    if (!srcNft) return undefined;
    return this.apis.find((s) => s.supports(srcNft));
  }
  get maxDstNativeAmount(): CurrencyAmount | undefined {
    const {dstChainId, srcChainId} = this;
    if (!srcChainId) return undefined;
    if (!dstChainId) return undefined;
    const config = lzConfigStore.getDstConfig(srcChainId, dstChainId);
    return config?.dstNativeAmtCap;
  }
  get dstNativeAmount(): CurrencyAmount | undefined {
    const {dstNativeAmount, dstChainId} = this.form;
    if (!dstChainId) return undefined;
    const native = getNativeCurrency(dstChainId);
    const zero = CurrencyAmount.fromRawAmount(native, 0);

    if (!dstNativeAmount) return zero;
    if (dstNativeAmount === DstNativeAmount.NONE) return zero;
    if (DstNativeAmount.DEFAULT === dstNativeAmount) {
      const {dstNativeBalance} = this;
      const minAmount = airdropStore.getDefault(dstChainId);
      if (!dstNativeBalance) return undefined;
      if (!minAmount) return undefined;
      if (dstNativeBalance.lessThan(minAmount)) {
        return minAmount;
      }
      return zero;
    }

    if (dstNativeAmount === DstNativeAmount.MAX) {
      return this.maxDstNativeAmount;
    }

    return tryParseCurrencyAmount(native, dstNativeAmount);
  }
  get adapterParams(): AdapterParams | undefined {
    // testnet ERC1155 has adapter params disabled
    if (this.srcNftContract?.standard === OnftStandard.ERC1155) {
      return AdapterParams.forV1(0);
    }
    const {extraGas} = this;
    const {dstAddress, dstNativeAmount} = this;
    if (!dstAddress) return undefined;
    if (!dstNativeAmount) return undefined;
    if (extraGas === undefined) return undefined;

    return AdapterParams.forV2({
      extraGas: extraGas,
      dstNativeAddress: dstAddress,
      dstNativeAmount: dstNativeAmount,
    });
  }
  get errors(): ValidationError[] {
    const errors: ValidationError[] = [];
    const addError = (error: string, field?: string) => errors.push({error, field});

    const {form} = this;

    if (!form.items.length) addError('Select ONFT');

    if (!this.srcNativeBalance) {
      addError('Checking native balance');
    } else {
      if (this.messageFee && this.srcNativeBalance.lessThan(this.messageFee.nativeFee))
        addError('Not enough native gas');
    }

    if (!this.adapterParams) {
      if (!this.form.dstNativeAmount) {
        addError('Checking airdrop...');
      } else if (this.extraGas === undefined) {
        addError('Checking gas...');
      } else {
        addError('Set gas on destination');
      }
    }

    if (!this.messageFee) addError('Checking fee...');

    return errors;
  }
  get extraGas(): number | undefined {
    return fromPromiseValue(this.promise.extraGas);
  }
  get messageFee(): FeeQuote | undefined {
    return fromPromiseValue(this.promise.messageFee);
  }
  //
  // get selectedAssets(): Asset
  canSelectAsset(asset: OnftToken): boolean {
    const {srcNftContract: srcNft} = this;
    // no NFT selected
    if (!srcNft) return true;
    // Adding >= just because paranoia
    const MAX_SELECTED_TOKENS = 25;
    if (this.form.items.length >= MAX_SELECTED_TOKENS) return false;
    return isSameOnftContract(asset.contract, srcNft);
  }
  isAssetSelected(asset: OnftToken): boolean {
    return this.form.items.some((item) => isSameOnftToken(item.token, asset));
  }

  // actions
  selectAsset(asset: OnftToken): void {
    if (!this.canSelectAsset(asset)) return;
    this.form.items.push(
      new FormItem({
        token: asset,
        amount: 1,
      }),
    );
  }
  deselectAsset(asset: OnftToken): void {
    const items = this.form.items.filter((i) => !isSameOnftToken(i.token, asset));
    this.form.items = items;
  }
  clearSelection(): void {
    this.form.items.length = 0;
  }
  increaseAssetAmount(asset: OnftToken): void {
    if (asset.contract.standard !== OnftStandard.ERC1155) return;
    const item = this.form.items.find((i) => isSameOnftToken(i.token, asset));
    if (!item?.maxAmount) return;
    if (item.amount < item.maxAmount) {
      item.amount++;
    }
  }
  decreaseAssetAmount(asset: OnftToken): void {
    if (asset.contract.standard !== OnftStandard.ERC1155) return;
    const item = this.form.items.find((i) => isSameOnftToken(i.token, asset));
    if (!item?.maxAmount) return;
    if (item.amount > 1) {
      item.amount--;
    }
  }
  updateMessageFee() {
    this.promise.messageFee = undefined;
    const {srcChainId, dstChainId, api, adapterParams} = this;
    const {amounts: assets} = this.form;

    if (!srcChainId) return;
    if (!dstChainId) return;
    if (!api) return;
    if (!assets.length) return;
    if (!adapterParams) return;
    this.promise.messageFee = fromPromise(api.getMessageFee(assets, dstChainId, adapterParams));
  }
  updateAssets = flow(
    function* (this: OnftBridgeStore, onftContract: OnftContract, address: string) {
      const api = this.apis.find((s) => s.supports(onftContract));
      if (!api) return;
      const assets: OnftTokenAmount[] = yield api.getAssets(onftContract, address);
      const balances = this.balances.get(address) ?? [];
      const rest = balances.filter((other) => !isEqual(other.token, onftContract));
      this.balances.set(address, [...rest, ...assets]);
    }.bind(this),
  );
  updateExtraGas() {
    this.promise.extraGas = undefined;
    const {api, srcNftTokens, dstChainId} = this;
    if (!srcNftTokens || srcNftTokens.length === 0) return;
    if (!dstChainId) return;
    if (!api) return;
    this.promise.extraGas = fromPromise(api.getExtraGas(srcNftTokens, dstChainId));
  }

  setDstNativeAmount(amount: DstNativeAmount | string) {
    this.form.dstNativeAmount = amount;
  }
  setDstChainId(dstChainId: ChainId | undefined): void {
    this.form.dstChainId = dstChainId;
  }
  addBridge(api: OnftBridgeApi<unknown>): void {
    this.apis.push(api);
  }
  addCollection(collection: Collection): void {
    this.collections.push(collection);
  }

  bridge = flow(
    function* (this: OnftBridgeStore) {
      try {
        this.isExecuting = true;
        const {
          srcWallet,
          dstChainId,
          srcChainId,
          messageFee,
          srcAddress,
          dstAddress,
          adapterParams,
          api,
          srcNftContract,
          dstNftContract,
        } = this;
        const {amounts} = this.form;
        const assets = amounts.slice();

        assert(assets.length);
        assert(srcWallet);
        assert(srcChainId);
        assert(dstChainId);
        assert(messageFee);
        assert(srcAddress);
        assert(dstAddress);
        assert(adapterParams);
        assert(api);
        assert(dstNftContract);
        assert(srcNftContract);
        // ensure all from same nft
        for (const item of assets) {
          assert(isSameOnftContract(item.token.contract, srcNftContract));
        }

        const input: OnftTransferInput = {
          srcChainId,
          dstChainId,
          assets,
          srcAddress,
          dstAddress,
          adapterParams,
          fee: messageFee,
        };

        const srcTokens = assets.map((a) => a.token);

        yield srcWallet.switchChain(srcChainId);
        yield assertWallet(srcWallet, {chainId: srcChainId, address: srcAddress});

        // This looks like it's just approving one asset but under the hood it's setting approval for all
        const isApproved: Awaited<ReturnType<typeof api['isApproved']>> = yield api.isApproved(
          srcTokens,
          srcAddress,
        );
        if (!isApproved) {
          this.isApproving = true;
          const unsignedTransaction: Awaited<ReturnType<typeof api['approve']>> = yield api.approve(
            srcTokens,
          );
          const approveTransaction: Awaited<
            ReturnType<typeof unsignedTransaction['signAndSubmitTransaction']>
          > = yield unsignedTransaction.signAndSubmitTransaction(srcWallet.signer);

          yield approveTransaction.wait();

          this.isApproving = false;
        }

        this.isSigning = true;
        const unsignedTransaction: Awaited<ReturnType<typeof api.transfer>> = yield api.transfer(
          input,
        );
        const transferTransaction: Awaited<
          ReturnType<typeof unsignedTransaction['signAndSubmitTransaction']>
        > = yield unsignedTransaction.signAndSubmitTransaction(srcWallet.signer);
        this.isSigning = false;

        this.isMining = true;
        const receipt: Awaited<ReturnType<typeof transferTransaction.wait>> =
          yield transferTransaction.wait();
        this.isMining = false;

        const tx = transactionStore.create({
          type: 'TRANSFER',
          input,
          chainId: srcChainId,
          expectedDate: getExpectedDate(srcChainId, dstChainId),
          txHash: receipt.txHash,
        });

        toast.success(
          <Toast>
            <h1>Transaction Submitted</h1>
            <a target='_blank' href={getScanLink(srcChainId, receipt.txHash)} rel='noreferrer'>
              View on Explorer
            </a>
          </Toast>,
        );

        this.inflight.push({
          assets,
          srcChainId,
          dstChainId,
          srcTxHash: receipt.txHash,
          blockTimestamp: timeStamp(),
        });

        for (const asset of amounts) {
          this.updateAssets(asset.token.contract, srcAddress);
        }

        waitForMessageReceived(srcChainId, receipt.txHash, 5_000).then((message) => {
          this.updateAssets(dstNftContract, dstAddress);
          tx.update({
            completed: true,
            confirmation: {
              chainId: message.dstChainId,
              txHash: message.dstTxHash,
            },
          });
          toast.success(
            <Toast>
              <h1>Transaction Completed</h1>
              <a
                target='_blank'
                href={getScanLink(message.dstChainId, message.dstTxHash)}
                rel='noreferrer'
              >
                View on Explorer
              </a>
            </Toast>,
          );
        });
      } catch (e) {
        handleError(e, () => {
          const {message, title} = parseWalletError(e);
          toast.error(
            <Toast>
              <h1>{title}</h1>
              <p>{message}</p>
            </Toast>,
          );
        });
        throw e;
      } finally {
        this.isMining = false;
        this.isSigning = false;
        this.isApproving = false;
        this.isExecuting = false;
      }
    }.bind(this),
  );

  waitForInflight = flow(
    function* (this: OnftBridgeStore, tx: OnftInflightTransaction, address: string) {
      yield waitForMessageReceived(tx.srcChainId, tx.srcTxHash, 10_000);
      const srcContract = tx.assets.at(0)?.token.contract;
      assert(srcContract);

      const dstContract = this.collections
        .flatMap((c) => c.contracts)
        .find((c) => isSameOnftContract(srcContract, c));

      assert(dstContract);
      yield this.updateAssets(dstContract, address);
      const completed = this.inflight.filter((i) => i.srcTxHash === tx.srcTxHash);
      for (const tx of completed) {
        this.inflight = this.inflight.filter((i) => i !== tx);
      }
    }.bind(this),
  );

  updateInflight = flow(
    function* (this: OnftBridgeStore) {
      const address = walletStore.evm?.address;

      if (!address) return;
      const inflight: OnftInflightTransaction[] = [];
      for (const api of this.apis) {
        const batch: Awaited<ReturnType<typeof api['getInflight']>> = yield api.getInflight(
          address,
        );
        inflight.push(...batch);
      }
      // todo: restore nonce logic
      // if (localNonce !== globalNonce) return;
      this.inflight = inflight;
      // refresh once they are delivered
      const unique = uniqBy(inflight, (i) => i.srcTxHash);
      for (const tx of unique) {
        this.waitForInflight(tx, address);
      }
    }.bind(this),
  );
}

function getAllNative(): Currency[] {
  return onftStore.chains.map((chainId) => getNativeCurrency(chainId));
}

export function initOnftStore() {
  const updateDstConfig = () => {
    const {srcChainId, dstChainId} = onftStore;
    if (!srcChainId) return;
    if (!dstChainId) return;
    lzConfigStore.updateDstConfig(srcChainId, dstChainId);
  };

  const updateEvmBalance = () => {
    const {srcAddress} = onftStore;
    if (!srcAddress) return;
    getAllNative()
      .filter((token) => isEvmChainId(token.chainId))
      .forEach((token) => {
        balanceStore.updateBalance(token, srcAddress);
      });
  };

  const updateMessageFee = () => {
    const {srcChainId, dstChainId} = onftStore;
    const {adapterParams} = onftStore;
    const {items} = onftStore.form;
    if (!srcChainId) return;
    if (!dstChainId) return;
    if (!adapterParams) return;
    if (!items.length) return;

    onftStore.updateMessageFee();
  };

  const updateAssets = () => {
    const {collections, srcAddress} = onftStore;
    if (!srcAddress) return;
    collections.forEach((collection) => {
      collection.contracts.forEach((contract) => {
        onftStore.updateAssets(contract, srcAddress);
      });
    });
  };

  const updateExtraGas = () => {
    const {dstChainId, items} = onftStore.form;
    const {api} = onftStore;
    if (!items) return;
    if (!dstChainId) return;
    if (!api) return;
    onftStore.updateExtraGas();
  };

  const updateDefaultAirdropAmount = () => {
    const {dstChainId} = onftStore.form;
    if (!dstChainId) return;
    airdropStore.updateDefaultAmount(dstChainId);
  };

  const updateInflight = async () => {
    // hack: should look at wallet address not srcAddress
    // but accessing evm.account causes this function to be called multiple times
    const {apis, srcAddress} = onftStore;
    if (!srcAddress) return;
    if (!apis) return;
    onftStore.updateInflight();
  };

  const handlers = [
    //
    autorun(() => updateEvmBalance()),
    autorun(() => updateMessageFee()),
    autorun(() => updateExtraGas()),
    autorun(() => updateAssets()),
    autorun(() => updateDefaultAirdropAmount()),
    autorun(() => updateInflight()),
    autorun(() => updateDstConfig()),
  ];
  // unregister
  return () => {
    handlers.forEach((handler) => handler());
  };
}

export const onftStore = new OnftBridgeStore();

type NetworkSelectOption = {
  chainId: ChainId;
  disabled?: boolean;
  overlay?: React.ReactNode;
};
