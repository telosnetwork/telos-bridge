import {ChainId} from '@layerzerolabs/lz-sdk';
import {waitForMessageReceived} from '@layerzerolabs/scan-client';
import type {BridgeApi, TransferInput} from '@layerzerolabs/ui-bridge-sdk';
import {
  AdapterParams,
  BigintIsh,
  castCurrencyAmountUnsafe,
  Currency,
  CurrencyAmount,
  FeeQuote,
  Fraction,
  getExpectedDate,
  getNativeCurrency,
  getScanLink,
  getTransactionLink,
  isEvmChainId,
  Percent,
  TransactionResult,
  tryGetNetwork,
  tryParseCurrencyAmount,
  tryParseNumber,
} from '@layerzerolabs/ui-core';
import {ONE_ADDRESS} from '@layerzerolabs/ui-evm';
import {assertWallet, Wallet} from '@layerzerolabs/ui-wallet';
import assert from 'assert';
import { Contract, ethers } from 'ethers';
import {autorun, computed, flow, makeAutoObservable} from 'mobx';
import {fromPromise} from 'mobx-utils';
import {toast} from 'react-toastify';

import {airdropStore} from '@/core/stores/airdropStore';
import {balanceStore} from '@/core/stores/balanceStore';
import {fiatStore} from '@/core/stores/fiatStore';
import {lzConfigStore} from '@/core/stores/lzStore';
import {transactionStore} from '@/core/stores/transactionStore';
import {uiStore} from '@/core/stores/uiStore';
import {getWalletBalance} from '@/core/stores/utils';
import {walletStore} from '@/core/stores/walletStore';
import {Toast} from '@/core/ui/Toast';
import {FromPromise, fromPromiseValue} from '@/core/utils/fromPromise';
import {handleError} from '@/core/utils/handleError';
import {parseWalletError} from '@/core/utils/parseWalletError';

import { oftAbi } from '../../../abi/oftAbi';
import { nativeConfig, rpcList } from '../../../config';
import {unclaimedStore} from './unclaimedStore';

export enum DstNativeAmount {
  DEFAULT = 'DEFAULT',
  MAX = 'MAX',
}

export type ValidationError = string;

export class NativeBridgeStore {
  isLoading = false;
  isSigning = false;
  isMining = false;
  isExecuting = false;
  isApproving = false;

  form: BridgeFrom = {
    srcCurrency: undefined,
    dstCurrency: undefined,
    srcChainId: undefined,
    dstChainId: undefined,
    amount: '',
    dstNativeAmount: DstNativeAmount.DEFAULT,
  };

  apis: BridgeApi<unknown, AnyFee>[] = [];
  currencies: Currency[] = nativeConfig.tokens;
  chains: number[] = [ChainId.TELOS_TESTNET, ChainId.FUJI];

  promise: BridgePromise = {
    output: undefined,
    allowance: undefined,
    extraGas: undefined,
    messageFee: undefined,
  };

  constructor() {
    makeAutoObservable(
      this,
      {
        adapterParams: computed.struct,
        dstNativeAmount: computed.struct,
        amount: computed.struct,
        allowance: computed.struct,
        extraGas: computed.struct,
        messageFee: computed.struct,
        output: computed.struct,
        dstNativeBalance: computed.struct,
        srcNativeBalance: computed.struct,
      },
      {autoBind: true},
    );
  }

  // preferred order of network selection list
  static chainOrder = [ChainId.TELOS, ChainId.ETHEREUM, ChainId.BSC, ChainId.POLYGON, ChainId.ZKSYNC, ChainId.ZKCONSENSYS, ChainId.AVALANCHE,  ChainId.ARBITRUM];

  static sortChains(chains: ChainId[]): ChainId[] {
    return chains.sort((a,b) => this.chainOrder.indexOf(b) - this.chainOrder.indexOf(a));
  }

  // views
  get output(): BridgeOutput | undefined {
    return this.promise.output;
  }

  get messageFee(): FeeQuote | undefined {
    return fromPromiseValue(this.promise.messageFee);
  }

  get extraGas(): number | undefined {
    return fromPromiseValue(this.promise.extraGas);
  }

  get allowance(): CurrencyAmount | undefined {
    return fromPromiseValue(this.promise.allowance);
  }

  get transferApi():
    | BridgeApi<unknown, CurrencyAmount | Record<string, CurrencyAmount>>
    | undefined {
    const {srcCurrency, dstCurrency} = this.form;
    if (!srcCurrency) return undefined;
    if (!dstCurrency) return undefined;
    return this.apis.find((s) => s.supportsTransfer(srcCurrency, dstCurrency));
  }

  get claimApi(): BridgeApi<unknown, unknown> | undefined {
    const {dstCurrency} = this.form;
    if (!dstCurrency) return undefined;
    return this.apis.find((s) => s.supportsClaim(dstCurrency));
  }

  get srcCurrencyOptions(): CurrencyOption[] {
    return this.currencies.map((currency) => {
      const disabled = false;

      const balance = getWalletBalance(currency);
      const isZero = !balance || balance?.equalTo(0);
      return {
        currency,
        disabled,
        overlay: disabled && !isZero ? 'Not available' : undefined,
      };
    });
  }

  get dstCurrencyOptions(): CurrencyOption[] {
    return this.currencies
      .map((currency) => {
        return {
          currency,
          valid: true,
          disabled: false,
        };
      })
      .filter((i) => !i.disabled);
  }

  get srcCurrencyOptionsGroups(): OptionGroup<CurrencyOption>[] {
    const {srcChainId} = this.form;
    const {srcCurrencyOptions} = this;
    const src: OptionGroup<CurrencyOption> = {
      title: tryGetNetwork(srcChainId)?.name + ' Network',
      key: 'src',
      items: srcCurrencyOptions
        .filter((o) => o.currency.chainId === srcChainId),
    };

    const all: OptionGroup<CurrencyOption> = {
      title: 'All networks',
      key: 'all',
      items: srcCurrencyOptions
        .filter((o) => o.currency.chainId !== srcChainId),
    };

    return [src, all].filter((g) => g.items.length > 0);
  }

  get dstCurrencyOptionsGroups(): OptionGroup<CurrencyOption>[] {
    const {dstChainId} = this.form;
    const {dstCurrencyOptions} = this;

    const all: OptionGroup<CurrencyOption> = {
      title: 'All networks',
      key: 'all',
      items: dstCurrencyOptions.filter((i) => i.currency.chainId !== dstChainId),
    };

    if (!dstChainId) return [all];

    const dst: OptionGroup<CurrencyOption> = {
      title: tryGetNetwork(dstChainId)?.name ?? dstChainId + ' Network',
      key: 'dst',
      items: dstCurrencyOptions.filter((i) => i.currency.chainId === dstChainId),
    };

    return [dst, all].filter((group) => group.items.length > 0);
  }

  get srcNetworkOptions(): ChainOption[] {
    const chainList = Array.from(new Set(this.srcCurrencyOptions.map((c) => c.currency.chainId)));
    const chains = NativeBridgeStore.sortChains(chainList);

    return chains.map((chainId) => ({
      chainId,
      disabled: false,
    }));
  }

  get dstNetworkOptions(): ChainOption[] {
    const {srcCurrency} = this.form;

    return this.chains.map((dstChainId) => {
      const error: string | undefined = srcCurrency
        ? srcCurrency.chainId === dstChainId
          ? 'Transfers between same chain not available'
          : findMatchingCurrency(srcCurrency) === undefined
          ? `${fiatStore.getSymbol(srcCurrency)} is not available on ${
              tryGetNetwork(dstChainId)?.name
            }`
          : undefined
        : undefined;

      return {
        chainId: dstChainId,
        disabled: !!error,
        overlay: error,
      };
    });
  }

  get dstWallet(): Wallet<unknown> | undefined {
    const {dstChainId} = this.form;
    if (dstChainId) {
      if (isEvmChainId(dstChainId)) return walletStore.evm;
    }
    return undefined;
  }

  get srcWallet(): Wallet<unknown> | undefined {
    const {srcChainId} = this.form;
    if (srcChainId) {
      if (isEvmChainId(srcChainId)) return walletStore.evm;
    }
    return undefined;
  }

  get srcAddress(): string | undefined {
    return this.srcWallet?.address;
  }

  get dstAddress(): string | undefined {
    return this.dstWallet?.address;
  }

  get srcNativeBalance(): CurrencyAmount | undefined {
    if (!this.form.srcChainId) return undefined;
    const native = getNativeCurrency(this.form.srcChainId);
    return getWalletBalance(native);
  }

  get dstNativeBalance(): CurrencyAmount | undefined {
    if (!this.form.dstChainId) return undefined;
    const native = getNativeCurrency(this.form.dstChainId);
    return getWalletBalance(native);
  }

  get srcNativeCost(): CurrencyAmount | undefined {
    return this.messageFee?.nativeFee;
  }

  get maxDstNativeAmount(): CurrencyAmount | undefined {
    const {dstChainId, srcChainId} = this.form;
    if (!srcChainId) return undefined;
    if (!dstChainId) return undefined;
    const config = lzConfigStore.getDstConfig(srcChainId, dstChainId);
    return config?.dstNativeAmtCap;
  }

  get maxAmount(): CurrencyAmount | undefined {
    const {srcChainId} = this.form;
    const {srcBalance, srcNativeCost} = this;
    if (!srcChainId) return undefined;
    if (!srcBalance) return undefined;
    if (isEvmChainId(srcChainId)) {
      if (!srcNativeCost) return undefined;
      if (!srcBalance.currency.equals(srcNativeCost.currency)) return srcBalance;
      const maxAmount = srcBalance.subtract(srcNativeCost);
      if (maxAmount.greaterThan(0)) return maxAmount;
    }
    return undefined;
  }

  get srcBalance(): CurrencyAmount | undefined {
    return getWalletBalance(this.form.srcCurrency);
  }

  get dstBalance(): CurrencyAmount | undefined {
    return getWalletBalance(this.form.dstCurrency);
  }

  get amount(): CurrencyAmount | undefined {
    return tryParseCurrencyAmount(this.form.srcCurrency, this.form.amount);
  }

  get outputAmount(): CurrencyAmount | undefined {
    return this.output?.amount;
  }

  get minAmount(): CurrencyAmount | undefined {
    const {amount} = this;
    const {dstCurrency} = this.form;
    if (!amount) return undefined;
    if (!dstCurrency) return undefined;
    const percentage = amount.multiply(new Percent(100, 100));
    // minAmount and outputAmount must be always in dstCurrency
    return castCurrencyAmountUnsafe(percentage, dstCurrency);
  }

  get dstNativeAmount(): CurrencyAmount | undefined {
    const {dstNativeAmount, dstChainId} = this.form;
    if (!dstChainId) return undefined;
    const native = getNativeCurrency(dstChainId);
    const zero = CurrencyAmount.fromRawAmount(native, 0);

    if (!dstNativeAmount) return zero;

    if (DstNativeAmount.DEFAULT === dstNativeAmount) {
      if (!this.srcAddress) return zero;
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
  
  get errors() {
    const errors: ValidationError[] = [];
    function addError(error: string) {
      errors.push(error);
    }
    const { amount } = this;
    const {srcChainId, dstChainId} = this.form;
    if (srcChainId && srcChainId === dstChainId) {
      addError('Select different chain');
    }
    // if (srcNativeCost && srcNativeBalance) {
    //   if (srcNativeCost.greaterThan(srcNativeBalance)) {
    //     addError('Not enough native for gas');
    //   }
    // }
    if (!dstChainId) addError('Select network');
    if (!srcChainId) {
      addError('Select network');
    }
    if (!amount || !amount.greaterThan(0)) {
      addError('Enter amount');
    } else if (this.maxAmount?.lessThan(amount)) {
      addError('Insufficient balance');
    } else if (this.outputAmount?.equalTo(0)) {
      addError('Enter amount');
    }
    if (srcChainId && srcChainId === dstChainId) {
      addError('Change network');
    }
    // if (!this.dstNativeAmount) {
    //   addError('Set gas on destination');
    // } else if (
    //   this.maxDstNativeAmount &&
    //   this.dstNativeAmount.greaterThan(this.maxDstNativeAmount)
    // ) {
    //   addError('Gas too large');
    // }

    if (!this.messageFee) addError('Checking fee ...');
    if (!this.output) addError('Checking fee ...');
    return errors;
  }

  get unclaimed(): CurrencyAmount[] {
    const {unclaimed} = unclaimedStore;
    return unclaimed.map((balance) => balance.amount);
  }

  get hasUnclaimed(): boolean {
    return this.unclaimed.length > 0;
  }

  get isApproved(): boolean | undefined {
    const {allowance, amount} = this;
    if (!allowance || !amount) return undefined;
    return !amount.greaterThan(allowance);
  }

  get adapterParams(): AdapterParams | undefined {
    const {dstNativeAmount, dstAddress, extraGas} = this;
    if (!extraGas === undefined) return undefined;
    if (!dstNativeAmount) return undefined;
    if (dstNativeAmount.equalTo(0)) {
      return AdapterParams.forV1(extraGas);
    }
    return AdapterParams.forV2({
      extraGas,
      dstNativeAmount: dstNativeAmount,
      dstNativeAddress: dstAddress ?? ONE_ADDRESS,
    });
  }

  get srcContractAddress(): string | undefined {
    const {srcChainId} = nativeBridgeStore.form;
    if (nativeBridgeStore.form.srcChainId){
      return nativeConfig.proxy.find(token => token.chainId === srcChainId)?.address;
    }
  }

  get srcContractInstance(): Contract | undefined {
    if (nativeBridgeStore.srcContractAddress){
      const {srcChainId} = this.form;
      const wallet = walletStore.evm;
      const rpc = rpcList.find((rpc) => rpc.chainId === srcChainId);
      const provider = rpc?.nativeChainId === wallet?.nativeChainId ? 
        wallet?.signer : 
        ethers.getDefaultProvider(rpc?.rpc);

      return new ethers.Contract(this.srcContractAddress as string, oftAbi, provider)
    }  
  }

  // actions
  async updateAllowance(): Promise<unknown> {
    this.promise.allowance = undefined;
    const {srcAddress} = this;
    const {srcCurrency} = this.form;
    if (!srcAddress) return;
    if (!srcCurrency) return;
    // return (this.promise.allowance = fromPromise(
      // transferApi.getAllowance(srcCurrency, srcAddress),
    // ));
  }

  async setAmount(amount: string) {
    if (tryParseNumber(amount) !== undefined) {
      this.form.amount = amount;
      this.updateOutput();
      await this.updateMessageFee();
    }
  }

  setDstNativeAmount(amount: string | DstNativeAmount): void {
    if (amount in DstNativeAmount) {
      this.form.dstNativeAmount = amount;
    }
    const {dstChainId} = this.form;
    if (!dstChainId) return;

    const dstNative = getNativeCurrency(dstChainId);
    if (amount === '' || tryParseCurrencyAmount(dstNative, amount) !== undefined) {
      this.form.dstNativeAmount = amount;
    }
  }

  setMaxAmount() {
    if (!this.maxAmount) return;
    this.form.amount = this.maxAmount.toExact();
  }
  
  setSrcChainId(chainId: ChainId): void {
    this.form.srcChainId = chainId;
  }

  setDstChainId(chainId: ChainId): void {
    this.form.dstChainId = chainId;
  }

  setSrcCurrency(currency: Currency) {
    this.form.srcCurrency = currency;
    this.form.srcChainId = currency.chainId;
    if (!this.form.dstCurrency) {
      const dstCurrency = findMatchingCurrency(currency);
      this.form.dstCurrency = dstCurrency;
      this.form.dstChainId = dstCurrency?.chainId;
    }
  }

  setDstCurrency(currency: Currency) {
    this.form.dstCurrency = currency;
    this.form.dstChainId = currency.chainId;
  }

  switch() {
    const {form} = this;
    [form.srcChainId, form.dstChainId, form.srcCurrency, form.dstCurrency] = [
      form.dstChainId,
      form.srcChainId,
      form.dstCurrency,
      form.srcCurrency,
    ];
  }

  transfer = flow(function* (this: NativeBridgeStore) {
    try {
      this.isExecuting = true;

      const {
        form,
        srcWallet,
        dstWallet,
        messageFee: fee,
        amount,
        minAmount,
        srcAddress,
        dstAddress,
        adapterParams,
        outputAmount,
        dstNativeBalance,
      } = this;
      const {srcChainId, dstChainId, dstCurrency, srcCurrency} = form;

      assert(srcChainId, 'srcChainId');
      assert(dstChainId, 'dstChainId');
      assert(srcCurrency, 'srcCurrency');
      assert(dstCurrency, 'dstCurrency');
      assert(srcAddress, 'srcAddress');
      assert(dstAddress, 'dstAddress');
      assert(fee, 'fee');
      assert(amount, 'amount');
      assert(minAmount, 'minAmount');
      assert(adapterParams, 'adapterParams');
      assert(outputAmount, 'outputAmount');
      assert(srcWallet?.address, 'srcWallet');
      assert(dstWallet?.address, 'dstWallet');
      assert(dstNativeBalance, 'dstNativeBalance');

      if (!this.isApproved && srcCurrency.chainId !== ChainId.TELOS_TESTNET) {
        // yield this.approve();
      }

      const input: TransferInput = {
        srcChainId,
        dstChainId,
        srcCurrency,
        dstCurrency,
        srcAddress,
        dstAddress,
        amount,
        minAmount,
        fee,
        adapterParams,
      };

      yield srcWallet.switchChain(srcChainId);
      this.isSigning = true;
      const transactionResult: any = yield this.sendNative();

      // ensure correct wallet
      yield assertWallet(srcWallet, {chainId: srcChainId, address: srcAddress});

      this.isSigning = false;
      this.isMining = true;

      toast.success(
        <Toast>
          <h1>Transaction Submitted</h1>
          <p>
            <a href={getScanLink(srcChainId, transactionResult.hash)} target='_blank' rel='noreferrer'>
              View on block explorer
            </a>
          </p>
        </Toast>,
      );

      const receipt = yield transactionResult.wait();
      this.isMining = false;

      const tx = transactionStore.create({
        chainId: srcChainId,
        txHash: receipt.transactionHash,
        type: 'TRANSFER',
        input,
        expectedDate: getExpectedDate(srcChainId, dstChainId),
      });

      this.updateBalances();
      
      waitForMessageReceived(srcChainId, receipt.transactionHash)
        .then((message) => {
          // never mark tx as failed
          // we will eventually deliver the tx
          tx.update({
            completed: true,
            confirmation: {
              chainId: message.dstChainId,
              txHash: message.dstTxHash,
            },
          });
        })
        .finally(() => {
          this.updateBalances();
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
      this.isSigning = false;
      this.isMining = false;
      this.isExecuting = false;
    }
  });

  sendNative: () => unknown = flow(function* (this: NativeBridgeStore) {

    const {srcCurrency, srcChainId, dstChainId, amount} = this.form;

    assert(srcChainId, 'srcChainId');
    assert(dstChainId, 'dstChainId');
    assert(srcCurrency, 'srcCurrency');
    assert(this.messageFee, 'messageFee');
    assert(this.srcContractInstance, 'srcContractInstance');
    assert(this.dstNativeAmount, 'dstNativeAmount');

    const qty = ethers.utils.parseEther(amount)
    const toAddress = walletStore.evm?.address;
    const toAddressBytes = ethers.utils.defaultAbiCoder.encode(["address"], [toAddress])
    // const dstNativeGas = CurrencyAmount.fromRawAmount(srcCurrency, this.dstNativeAmount.quotient);
    // if sending from Telos network, include amount in total native token sent
    const fee = srcChainId === ChainId.TELOS_TESTNET ?
      this.messageFee.nativeFee.add(CurrencyAmount.fromRawAmount(srcCurrency, qty.toBigInt())):
      this.messageFee.nativeFee;

    // includes native amount if sending native TLOS
    const totalEth =  ethers.BigNumber.from(fee.quotient);

    const adapterParams = ethers.utils.solidityPack(["uint16", "uint256"], [1, 200000]);
    // const adapterParams = ethers.utils.solidityPack(["uint16", "uint256", "uint256", "address"], [1, 200000, this.dstNativeAmount.quotient, toAddress ]);
    // const adapterParams = ethers.utils.solidityPack(["uint16", "uint256", "uint256", "address"], [2, 200000, 55555555555, toAddress ]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tx: unknown = yield this.srcContractInstance.sendFrom(
      toAddress, // 'from' address to send tokens
      dstChainId, // remote LayerZero chainId
      toAddressBytes, // 'to' address to send tokens
      qty, // amount of tokens to send (in wei)
      {
        refundAddress: toAddress,
        zroPaymentAddress: ethers.constants.AddressZero,
        adapterParams,
      },
      { value: totalEth } 
    )

    return tx;
  })

  approve: () => Promise<void> = flow(function* (this: NativeBridgeStore) {
    this.isApproving = true;
    try {
      const {transferApi, amount, srcWallet, srcAddress} = this;
      // assert(transferApi, 'transferApi');
      assert(amount, 'amount');
      assert(srcWallet, 'srcWallet');
      assert(srcAddress, 'srcAddress');

      yield srcWallet.switchChain(amount.currency.chainId);

      yield assertWallet(srcWallet, {
        chainId: amount.currency.chainId,
        address: srcAddress,
      });

      const unsignedTransaction: Awaited<ReturnType<typeof transferApi['approve']>> =
        yield transferApi.approve(amount);

      const transactionResult: Awaited<
        ReturnType<typeof unsignedTransaction['signAndSubmitTransaction']>
      > = yield unsignedTransaction.signAndSubmitTransaction(srcWallet.signer);
      yield transactionResult.wait();
      yield this.updateAllowance();
    } finally {
      this.isApproving = false;
    }
  });

  async updateBalances() {
    const {evm} = walletStore;
    const allTokens = getAllTokens();
    const promises = allTokens.map((token) => {
      if (evm) {
        balanceStore.updateBalance(token, evm.address);
      } 
    });
    return Promise.allSettled(promises);
  }

  updateOutput = flow(function* (this: NativeBridgeStore) {
    this.promise.output = undefined;
    const {dstCurrency} = this.form;
    const {amount} = this;
    if (!amount) return;
    if (!dstCurrency) return;

    yield (this.promise.output = 
      {
        amount: amount,
        fees: { totalFee:  CurrencyAmount.fromRawAmount(dstCurrency, 0)}
      }
    );
  });

  updateMessageFee = flow(function* (this: NativeBridgeStore) {
    this.promise.messageFee = undefined;
    const toAddress = walletStore.evm?.address;  
    const { srcCurrency, dstChainId, amount} = this.form;
    const { srcContractInstance} = this;

    if (!dstChainId) return;
    if (!amount) return;
    if (!srcContractInstance) return;

    const toAddressBytes = ethers.utils.defaultAbiCoder.encode(["address"], [toAddress])

    const qty = ethers.utils.parseEther(amount)

    // We want to introduce a buffer to avoid any gas price fluctuations
    // to affect the user experience
    //
    // The user will be refunded so this increase does not affect the actual price
    const multiplier = new Fraction(110, 100);

    const adapterParams = ethers.utils.solidityPack(["uint16", "uint256"], [1, 200000]);
    // const adapterParams = ethers.utils.solidityPack(["uint16", "uint256", "uint256", "address"], [2, 200000, this.dstNativeAmount?.quotient, toAddress ]);

    yield (this.promise.messageFee = fromPromise(
      (nativeBridgeStore.srcContractInstance as Contract).estimateSendFee(dstChainId, toAddressBytes, qty, false, adapterParams).then((fee: {nativeFee: number, zroFee: number}) => ({
          nativeFee: CurrencyAmount.fromRawAmount(srcCurrency as Currency, fee.nativeFee).multiply(multiplier),
          zroFee: CurrencyAmount.fromRawAmount(srcCurrency as Currency, fee.zroFee).multiply(multiplier),
        }))
    ));
    
  });

  updateExtraGas = flow(function* (this: NativeBridgeStore) {
    this.promise.extraGas = undefined;
    const {transferApi} = this;
    const {srcCurrency, dstCurrency} = this.form;
    if (!srcCurrency) return;
    if (!dstCurrency) return;
    if (!transferApi) return;

    yield (this.promise.extraGas = fromPromise(transferApi.getExtraGas(srcCurrency, dstCurrency)));
  });

  addBridge(bridge: BridgeApi<unknown, AnyFee>) {
    this.apis.push(bridge);
  }

  addCurrencies(currencies: Currency[]) {
    for (const newCurrency of currencies) {
      if (this.currencies.some((oldCurrency) => oldCurrency.equals(newCurrency))) {
        // skip if already in list
        continue;
      } else {
        this.currencies.push(newCurrency);
      }
    }
  }
}

function findMatchingCurrency(currency: Currency) {
  const {currencies} = nativeBridgeStore;
  return currencies.find((other) => {
    return other.chainId !== currency.chainId;
  });
}

export type CurrencyOption = {
  currency: Currency;
  disabled?: boolean;
  valid?: boolean;
  overlay?: React.ReactNode;
};

export type ChainOption = {
  chainId: ChainId;
  disabled?: boolean;
  overlay?: React.ReactNode;
};

export type OptionGroup<Option> = {
  title: React.ReactNode;
  key: React.Key;
  items: Option[];
};

type BridgeFrom = {
  srcCurrency: Currency | undefined;
  dstCurrency: Currency | undefined;
  srcChainId: ChainId | undefined;
  dstChainId: ChainId | undefined;
  amount: string;
  dstNativeAmount: DstNativeAmount | string;
};

type BridgePromise = {
  output: BridgeOutput | undefined;
  allowance: FromPromise<CurrencyAmount> | undefined;
  extraGas: FromPromise<number> | undefined;
  messageFee: FromPromise<FeeQuote> | undefined;
};

// returns all tokens native
function getAllTokens(): Currency[] {
  const nativeTokens = nativeBridgeStore.chains.map(getNativeCurrency);
  const bridgeTokens = nativeBridgeStore.currencies;
  const allTokens = Array.from(new Set([...nativeTokens, ...bridgeTokens]));
  return allTokens;
}

export function initNativeBridgeStore() {

  const updateEvmBalance = () => {
    const {evm} = walletStore;
    if (!evm) return;
    getAllTokens()
      .filter((token) => isEvmChainId(token.chainId))
      .forEach((token) => {
        balanceStore.updateBalance(token, evm.address);
      });
  };

  const updateDstPrice = () => {
    const {srcChainId, dstChainId} = nativeBridgeStore.form;
    if (!srcChainId) return;
    if (!dstChainId) return;
    lzConfigStore.updateDstConfig(srcChainId, dstChainId);
    lzConfigStore.updateDstPrice(srcChainId, dstChainId);
  };

  const updateDefaultAirdropAmount = () => {
    const {dstChainId} = nativeBridgeStore.form;
    if (!dstChainId) return;
    airdropStore.updateDefaultAmount(dstChainId);
  };

  const updateAllowance = () => {
    nativeBridgeStore.updateAllowance();
  };

  const setInitialSource = () => {
    nativeBridgeStore.setSrcChainId(ChainId.TELOS_TESTNET);
    nativeBridgeStore.setSrcCurrency(nativeConfig.tokens.find((token) => token.chainId === ChainId.TELOS_TESTNET) as Currency);
  }

  const handlers = [
    // each in separate `thread`
    autorun(() => updateEvmBalance()),
    autorun(() => updateDstPrice()),
    autorun(() => updateDefaultAirdropAmount()),
    autorun(() => updateAllowance()),
    autorun(() => setInitialSource()),
    // refresh
    interval(() => updateEvmBalance(), 30_000),

  ];

  // unregister
  return () => {
    handlers.forEach((handler) => handler());
  };
}

function interval(cb: () => void, timeMs: number) {
  const id = setInterval(cb, timeMs);
  return () => clearInterval(id);
}

type AnyFee = CurrencyAmount | Record<string, CurrencyAmount>;
type BridgeFee = Record<string, CurrencyAmount>;
type BridgeOutput = {amount: CurrencyAmount; fees: BridgeFee};

export const nativeBridgeStore = new NativeBridgeStore();
