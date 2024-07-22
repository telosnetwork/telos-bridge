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
  isAptosChainId,
  isEvmChainId,
  isNativeCurrency,
  isSolanaChainId,
  Token,
  TransactionResult,
  tryGetNetwork,
  tryParseCurrencyAmount,
  tryParseNumber,
} from '@layerzerolabs/ui-core';
import {ONE_ADDRESS, serializeAdapterParams} from '@layerzerolabs/ui-evm';
import {assertWallet, Wallet} from '@layerzerolabs/ui-wallet';
import assert from 'assert';
import { Contract,ethers } from 'ethers';
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
import { getTokenIcon } from '@/core/ui/CurrencyIcon';
import {Toast} from '@/core/ui/Toast';
import {FromPromise, fromPromiseValue} from '@/core/utils/fromPromise';
import {handleError} from '@/core/utils/handleError';
import {parseWalletError} from '@/core/utils/parseWalletError';

import { oftAbi } from '../../../abi/oftAbi';
import { ProxyConfig, telosNativeOft,TLOS_SYMBOL } from '../../../config';
import {unclaimedStore} from './unclaimedStore';

export enum DstNativeAmount {
  DEFAULT = 'DEFAULT',
  MAX = 'MAX',
}
export type ValidationError = string;

export class BridgeStore {
  isLoading = false;
  isSigning = false;
  isMining = false;
  isExecuting = false;
  isResetting = false;
  isApproving = false;
  isRegistering = false;

  form: BridgeFrom = {
    srcCurrency: undefined,
    dstCurrency: undefined,
    srcChainId: undefined,
    dstChainId: undefined,
    amount: '',
    dstNativeAmount: DstNativeAmount.DEFAULT,
  };

  apis: BridgeApi<unknown, AnyFee>[] = [];
  currencies: Currency[] = [];

  promise: BridgePromise = {
    output: undefined,
    allowance: undefined,
    limitAmount: undefined,
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
        limitAmount: computed.struct,
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
    return this.srcIsNativeTelos ? this.promise.output as BridgeOutput : fromPromiseValue(this.promise.output as FromPromise<BridgeOutput>);
  }

  get messageFee(): FeeQuote | undefined {
    return fromPromiseValue(this.promise.messageFee);
  }

  get extraGas(): number | undefined {
    return fromPromiseValue(this.promise.extraGas);
  }

  get limitAmount(): CurrencyAmount | undefined {
    return fromPromiseValue(this.promise.limitAmount);
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

    // use TLOS OFT api when destination currency is native TLOS
    if (this.dstIsNativeTelos){
      return this.apis.find(this.findTelosOftTransferApi);
    }

    return this.apis.find((s) => s.supportsTransfer(srcCurrency, dstCurrency));
  }

  get registerApi(): BridgeApi<unknown, unknown> | undefined {
    const {dstCurrency} = this.form;
    if (!dstCurrency) return undefined;

    // use TLOS OFT api when destination currency is native TLOS
    if (this.dstIsNativeTelos){
      return this.apis.find(this.findTelosOftTransferApi);
    }
    
    return this.apis.find((s) => s.supportsRegister(dstCurrency));
  }

  get claimApi(): BridgeApi<unknown, unknown> | undefined {
    const {dstCurrency} = this.form;
    if (!dstCurrency) return undefined;
    return this.apis.find((s) => s.supportsClaim(dstCurrency));
  }

  get chains(): ChainId[] {
    const chainList = Array.from(new Set(this.currencies.map((c) => c.chainId)));
    return BridgeStore.sortChains(chainList);
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
    const {srcCurrency} = this.form;

    return this.currencies
      .map((currency) => {
        const valid = srcCurrency ? isValidPair(srcCurrency, currency) : undefined;
        return {
          currency,
          valid,
          disabled: srcCurrency ? !valid : false,
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
      items: srcCurrencyOptions.filter((o) => o.currency.chainId === srcChainId),
    };

    const all: OptionGroup<CurrencyOption> = {
      title: 'All networks',
      key: 'all',
      items: srcCurrencyOptions.filter((o) => o.currency.chainId !== srcChainId),
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
    const chains = BridgeStore.sortChains(chainList);

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
          : isAptosChainId(srcCurrency.chainId) && isAptosChainId(dstChainId)
          ? 'Transfers between APTOS not available'
          : findMatchingCurrencyOnChain(srcCurrency, dstChainId) === undefined
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
      if (isAptosChainId(dstChainId)) return walletStore.aptos;
      if (isSolanaChainId(dstChainId)) return walletStore.solana;
      if (isEvmChainId(dstChainId)) return walletStore.evm;
    }
    return undefined;
  }

  get srcWallet(): Wallet<unknown> | undefined {
    const {srcChainId} = this.form;
    if (srcChainId) {
      if (isAptosChainId(srcChainId)) return walletStore.aptos;
      if (isSolanaChainId(srcChainId)) return walletStore.solana;
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
    if (isAptosChainId(srcChainId)) {
      const {limitAmount} = this;
      if (!limitAmount) return undefined;
      if (limitAmount.lessThan(srcBalance)) return limitAmount;
      return srcBalance;
    }
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
    // minAmount and outputAmount must be always in dstCurrency
    return castCurrencyAmountUnsafe(amount, dstCurrency);
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
    const {srcNativeBalance, srcNativeCost, amount, limitAmount, minAmount, outputAmount} = this;
    const {srcChainId, dstChainId, srcCurrency, dstCurrency} = this.form;
    if (srcChainId && srcChainId === dstChainId) {
      addError('Select different chain');
    }
    if (srcNativeCost && srcNativeBalance) {
      if (srcNativeCost.greaterThan(srcNativeBalance)) {
        addError('Not enough native for gas');
      }
    }
    if (!dstChainId) addError('Select network');
    if (!srcChainId) {
      addError('Select network');
    }
    if (!amount || !amount.greaterThan(0)) {
      addError('Enter amount');
    } else if (limitAmount?.lessThan(amount)) {
      addError('Limit exceeded');
    } else if (this.maxAmount?.lessThan(amount)) {
      addError('Insufficient balance');
    } else if (this.outputAmount?.equalTo(0)) {
      addError('Enter amount');
    }
    if (srcChainId && srcChainId === dstChainId) {
      addError('Change network');
    }
    if (!this.dstNativeAmount) {
      addError('Set gas on destination');
    } else if (
      this.maxDstNativeAmount &&
      this.dstNativeAmount.greaterThan(this.maxDstNativeAmount)
    ) {
      addError('Gas too large');
    }
    // sanity checks
    if (srcChainId && srcCurrency && srcChainId !== srcCurrency.chainId) {
      addError('Select other pair');
    }
    if (dstChainId && dstCurrency && dstChainId !== dstCurrency.chainId) {
      addError('Select other pair');
    }
    if (srcCurrency && dstCurrency && !isValidPair(srcCurrency, dstCurrency)) {
      addError('Select other pair');
    }
    if (!this.messageFee) addError('Checking fee ...');
    if (!this.output) addError('Checking fee ...');
    if (!this.srcIsNativeTelos && !limitAmount) addError('Checking limit...');
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

  get srcIsNativeTelos(): boolean {
    return this.form.srcCurrency?.symbol === TLOS_SYMBOL && this.form.srcChainId === ChainId.TELOS;
  }

  get dstIsNativeTelos(): boolean {
    return this.form.dstCurrency?.symbol === TLOS_SYMBOL && this.form.dstChainId === ChainId.TELOS
  }

  get srcContractInstance(): Contract | undefined {
      const wallet = walletStore.evm;
      // use default provider if signer not available 
      const provider = telosNativeOft.bridge.chainListId === wallet?.nativeChainId ? 
        wallet?.signer : 
        ethers.getDefaultProvider(telosNativeOft.bridge.rpc);

      return new ethers.Contract(telosNativeOft.proxy.address, oftAbi, provider)
  }

  get srcBridgeContractInstance(): Contract | undefined {
      const provider = ethers.getDefaultProvider(telosNativeOft.bridge.rpc);
      return new ethers.Contract(telosNativeOft.bridge.address, telosNativeOft.bridge.abi, provider)
  }

  findTelosOftTransferApi(api: any ): boolean {
    return api.config.proxy.some((p: ProxyConfig) => p.address === telosNativeOft.proxy.address);
  }

  async addToken(token: Token): Promise<void> {
    try {
      await walletStore.evm?.switchChain(token.chainId);

      (walletStore.evm as any).provider.request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20', 
          options: {
            address: token.address, 
            symbol: token.symbol, 
            decimals: token.decimals, 
            image: getTokenIcon(token.symbol), 
          },
        },
      });
    } catch (error) {
      console.log(error);
    }
  }

  async updateAllowance(): Promise<unknown> {
    this.promise.allowance = undefined;
    const {transferApi, srcAddress} = this;
    const {srcCurrency} = this.form;
    if (!transferApi) return;
    if (!srcAddress) return;
    if (!srcCurrency) return;
    return (this.promise.allowance = fromPromise(
      transferApi.getAllowance(srcCurrency, srcAddress),
    ));
  }

  setAmount(amount: string) {
    if (tryParseNumber(amount) !== undefined) {
      this.form.amount = amount;
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
    const {srcCurrency, dstCurrency} = this.form;
    if (srcCurrency) {
      this.form.srcCurrency = findCurrencyOnChain(srcCurrency, chainId);
    } else if (dstCurrency) {
      const srcCurrency = findMatchingCurrencyOnChain(dstCurrency, chainId);
      this.form.srcCurrency = srcCurrency;
    }

    // ensure dst selection is valid
    if (this.form.srcCurrency && this.form.dstCurrency) {
      if (!isValidPair(this.form.srcCurrency, this.form.dstCurrency)) {
        this.form.dstCurrency = findMatchingCurrencyOnChain(
          this.form.srcCurrency,
          this.form.dstCurrency.chainId,
        );
      }
    }
  }
  setDstChainId(chainId: ChainId): void {
    this.form.dstChainId = chainId;
    const {srcCurrency, dstCurrency} = this.form;
    if (srcCurrency) {
      const dstCurrency = findMatchingCurrencyOnChain(srcCurrency, chainId);
      this.form.dstCurrency = dstCurrency;
    } else if (dstCurrency) {
      this.form.dstCurrency = findCurrencyOnChain(dstCurrency, chainId);
    }
  }
  setSrcCurrency(currency: Currency) {
    if (!isSrcCurrencyValid(currency)) {
      this.form.dstChainId = undefined;
      this.form.dstCurrency = undefined;
    }
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

  transfer = flow(function* (this: BridgeStore) {
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
        transferApi,
        registerApi,
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
      assert(registerApi, 'registerApi');

      // try to register if possible
      let isRegistered = yield registerApi.isRegistered(dstCurrency, dstWallet.address);
      if (!isRegistered) {
        const unsignedTransaction: Awaited<ReturnType<typeof registerApi['register']>> =
          yield registerApi.register(dstCurrency);

        const estimatedGasAmount: Awaited<ReturnType<typeof unsignedTransaction['estimateNative']>> = 
          yield unsignedTransaction.estimateNative(dstWallet);

        if (dstNativeBalance.greaterThan(estimatedGasAmount)) {
          yield this.register();
          isRegistered = true;
        }
      }

      yield this.updateAllowance();

      if (!this.srcIsNativeTelos && !this.isApproved) {
        yield this.approve();
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


      let transactionResult: any = {};

      // if sending TLOS from Telos EVM, use contract method
      if (this.srcIsNativeTelos){
        transactionResult = yield this.sendNative();
        // ensure correct wallet
        yield assertWallet(srcWallet, {chainId: srcChainId, address: srcAddress});

        this.isSigning = false;
        this.isMining = true;
        transactionResult.wait();

      }else if(transferApi){
        const unsignedTransaction: Awaited<ReturnType<typeof transferApi['transfer']>> =
        yield transferApi.transfer(input);

        // ensure correct wallet
        yield assertWallet(srcWallet, {chainId: srcChainId, address: srcAddress});

        const transaction: Awaited<
          ReturnType<typeof unsignedTransaction['signAndSubmitTransaction']>
        > = yield unsignedTransaction.signAndSubmitTransaction(srcWallet.signer);  
        this.isSigning = false;
        this.isMining = true;
        const receipt: Awaited<ReturnType<TransactionResult['wait']>> = yield transaction.wait();
        this.isMining = false; 
        transactionResult.hash = receipt.txHash;     
      }
      if (!isRegistered) {
        uiStore.claimReminderAlert.open();
      }

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

      const tx = transactionStore.create({
        chainId: srcChainId,
        txHash: transactionResult.hash,
        type: 'TRANSFER',
        input,
        expectedDate: getExpectedDate(srcChainId, dstChainId),
      });

      waitForMessageReceived(srcChainId, transactionResult.hash)
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
          if (isAptosChainId(dstChainId)) {
            unclaimedStore.updateUnclaimedBalance(dstCurrency, dstAddress);
          }
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

  // bridge Telos EVM TLOS by calling `sendFrom` directly on the native oft contract instance 
  sendNative: () => unknown = flow(function* (this: BridgeStore) {

    const {srcCurrency, srcChainId, dstChainId, amount} = this.form;

    assert(srcChainId, 'srcChainId');
    assert(dstChainId, 'dstChainId');
    assert(srcCurrency, 'srcCurrency');
    assert(this.adapterParams, 'adapterParams');
    assert(this.messageFee, 'messageFee');
    assert(this.srcContractInstance, 'srcContractInstance');
    assert(this.dstNativeAmount, 'dstNativeAmount');

    const qty = ethers.utils.parseEther(amount)
    const toAddress = walletStore.evm?.address;
    const toAddressBytes = ethers.utils.defaultAbiCoder.encode(["address"], [toAddress])

    // if sending from Telos network, include amount in total native token sent
    const fee = srcChainId === ChainId.TELOS ?
      this.messageFee.nativeFee.add(CurrencyAmount.fromRawAmount(srcCurrency, qty.toBigInt())):
      this.messageFee.nativeFee;

    const totalEth =  ethers.BigNumber.from(fee.quotient);
    const serializedAdapterParams = serializeAdapterParams(this.adapterParams);

    const tx: unknown = yield this.srcContractInstance.sendFrom(
      toAddress, // 'from' address to send tokens
      dstChainId, // remote LayerZero chainId
      toAddressBytes, // 'to' address to send tokens
      qty, // amount of tokens to send (in wei)
      {
        refundAddress: toAddress,
        zroPaymentAddress: ethers.constants.AddressZero,
        adapterParams: serializedAdapterParams,
      },
      { value: totalEth } 
    )

    return tx;
  })

  register: () => Promise<unknown> = flow(function* (this: BridgeStore) {
    this.isRegistering = true;
    try {
      const {dstWallet, registerApi} = this;
      const {dstCurrency} = this.form;

      assert(dstCurrency, 'dstCurrency');
      assert(dstWallet, 'dstWallet');
      assert(registerApi, 'registerApi');

      const unsignedTransaction: Awaited<ReturnType<typeof registerApi['register']>> =
        yield registerApi.register(dstCurrency);

      const transactionResult: Awaited<
        ReturnType<typeof unsignedTransaction['signAndSubmitTransaction']>
      > = yield unsignedTransaction.signAndSubmitTransaction(dstWallet);

      const receipt: Awaited<ReturnType<typeof transactionResult['wait']>> =
        yield transactionResult.wait();

      toast.success(
        <Toast>
          <h1>Transaction Submitted</h1>
          <p>
            <a
              href={getTransactionLink(dstCurrency.chainId, receipt.txHash)}
              target='_blank'
              rel='noreferrer'
            >
              View on block explorer
            </a>
          </p>
        </Toast>,
      );
    } finally {
      this.isRegistering = false;
    }
  });

  approve: () => Promise<void> = flow(function* (this: BridgeStore) {
    this.isApproving = true;
    try {
      const {transferApi, amount, srcWallet, srcAddress} = this;
      assert(transferApi, 'transferApi');
      assert(amount, 'amount');
      assert(srcWallet, 'srcWallet');
      assert(srcAddress, 'srcAddress');

      yield srcWallet.switchChain(amount.currency.chainId);

      yield assertWallet(srcWallet, {
        chainId: amount.currency.chainId,
        address: srcAddress,
      });

      const allowance: CurrencyAmount = yield this.updateAllowance();
      if (allowance.numerator !== 0n) {
        this.isResetting = true;
        const zero = CurrencyAmount.fromRawAmount(amount.currency, 0);
        const unsignedResetTrx: Awaited<ReturnType<typeof transferApi['approve']>> = yield transferApi.approve(zero);
        yield unsignedResetTrx.signAndSubmitTransaction(srcWallet.signer);
        this.isResetting = false;
      }

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
    const {evm, aptos} = walletStore;
    const allTokens = getAllTokens();
    const promises = allTokens.map((token) => {
      if (evm && isEvmChainId(token.chainId)) {
        balanceStore.updateBalance(token, evm.address);
      } else if (aptos && isAptosChainId(token.chainId)) {
        balanceStore.updateBalance(token, aptos.address);
      }
    });
    return Promise.allSettled(promises);
  }

  updateOutput = flow(function* (this: BridgeStore) {
    this.promise.output = undefined;
    const {dstCurrency} = this.form;
    const {amount, transferApi} = this;
    if (!amount) return;
    if (!dstCurrency) return;
    if(this.srcIsNativeTelos){
      yield (this.promise.output = 
        {
          amount,
          fees: { totalFee:  CurrencyAmount.fromRawAmount(dstCurrency, 0)}
        }
      );
    }else if (transferApi){
      yield (this.promise.output = fromPromise(
        transferApi.getOutput(amount, dstCurrency).then((output) => ({
          amount: output.amount,
          fees: toBridgeFee(output.fee),
        })),
      ));
    }
  });

  updateMessageFee = flow(function* (this: BridgeStore) {
    this.promise.messageFee = undefined;

    const {srcCurrency, dstCurrency} = this.form;
    const {transferApi, adapterParams, srcBridgeContractInstance} = this;

    if (!srcCurrency) return;
    if (!dstCurrency) return;
    if (!adapterParams) return;

    // introduce buffer to avoid any gas price fluctuations that may affect user expereience
    // increase does not affect the actual price
    const multiplier = new Fraction(110, 100);

    // if source is telos EVM OFT get fees directly from bridge contract
    if (this.srcIsNativeTelos && srcBridgeContractInstance){
      const args: [ChainId, boolean, string] = [dstCurrency.chainId, false, serializeAdapterParams(adapterParams)];
      const nativeCurrency = getNativeCurrency(ChainId.TELOS);

      yield this.promise.messageFee = fromPromise(
        (srcBridgeContractInstance.estimateBridgeFee(...args)).then((fee: {nativeFee: BigintIsh, zroFee: BigintIsh}) => ({
            nativeFee: CurrencyAmount.fromRawAmount(nativeCurrency, fee.nativeFee).multiply(multiplier),
            zroFee: CurrencyAmount.fromRawAmount(nativeCurrency, fee.zroFee).multiply(multiplier),
          }))
      );
    }else if (transferApi){
      yield (this.promise.messageFee = fromPromise(
        transferApi.getMessageFee(srcCurrency, dstCurrency, adapterParams).then((fee) => ({
          nativeFee: fee.nativeFee.multiply(multiplier),
          zroFee: fee.zroFee.multiply(multiplier),
        })),
      ));
    }
  });

  updateExtraGas = flow(function* (this: BridgeStore) {
    this.promise.extraGas = undefined;
    const {transferApi} = this;
    const {srcCurrency, dstCurrency} = this.form;
    if (!srcCurrency) return;
    if (!dstCurrency) return;
    if (!transferApi) return;

    yield (this.promise.extraGas = fromPromise(transferApi.getExtraGas(srcCurrency, dstCurrency)));
  });

  updateLimit = flow(function* (this: BridgeStore) {
    this.promise.limitAmount = undefined;
    const {srcCurrency, dstCurrency} = this.form;
    const {transferApi} = this;
    if (!srcCurrency) return;
    if (!dstCurrency) return;
    if (!transferApi) return;

    yield (this.promise.limitAmount = fromPromise(transferApi.getLimit(srcCurrency, dstCurrency)));
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

function isValidPair(srcCurrency: Currency, dstCurrency: Currency): boolean {
  if (srcCurrency.chainId === dstCurrency.chainId) return false;
  // validate TLOS OFT pairs in addition to available api check
  return bridgeStore.apis.some((api) => api.supportsTransfer(srcCurrency, dstCurrency)) || srcCurrency.symbol === TLOS_SYMBOL && dstCurrency.symbol === TLOS_SYMBOL;
}

function findMatchingCurrency(currency: Currency) {
  const {currencies} = bridgeStore;
  return currencies.find((other) => isValidPair(currency, other));
}

// this is a heuristic only
function findCurrencyOnChain(aCurrency: Currency, chainId: ChainId) {
  const {currencies} = bridgeStore;
  return currencies.find((bCurrency) => {
    if (bCurrency.chainId !== chainId) return false;
    if (aCurrency.symbol.endsWith(fiatStore.getSymbol(bCurrency))) return true;
    if (bCurrency.symbol.endsWith(fiatStore.getSymbol(aCurrency))) return true;
    return false;
  });
}

function findMatchingCurrencyOnChain(currency: Currency, chainId: ChainId) {
  const {currencies} = bridgeStore;
  return currencies.find((other) => {
    return other.chainId === chainId && isValidPair(currency, other);
  });
}

function isSrcCurrencyValid(srcCurrency: Currency) {
  const {dstChainId, dstCurrency} = bridgeStore.form;
  if (!dstChainId) return true;
  // both can't be aptos
  if (isAptosChainId(dstChainId) && isAptosChainId(srcCurrency.chainId)) return false;
  // one has to be aptos
  if (!isAptosChainId(dstChainId) && !isAptosChainId(srcCurrency.chainId)) return false;
  if (dstCurrency) {
    return isValidPair(srcCurrency, dstCurrency);
  }
  return true;
}

function toBridgeFee(fees: AnyFee): BridgeFee {
  if (fees instanceof CurrencyAmount) return {totalFee: fees};
  return fees;
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
  output: FromPromise<BridgeOutput> | BridgeOutput | undefined;
  allowance: FromPromise<CurrencyAmount> | undefined;
  limitAmount: FromPromise<CurrencyAmount> | undefined;
  extraGas: FromPromise<number> | undefined;
  messageFee: FromPromise<FeeQuote> | undefined;
};

// returns all tokens native
function getAllTokens(): Currency[] {
  const nativeTokens = bridgeStore.chains.map(getNativeCurrency);
  const bridgeTokens = bridgeStore.currencies;
  const allTokens = Array.from(new Set([...nativeTokens, ...bridgeTokens]));
  return allTokens;
}

export function initBridgeStore() {
  const updateUnclaimedBalance = () => {
    const {aptos} = walletStore;
    if (!aptos) return;
    bridgeStore.currencies
      .filter((token) => isAptosChainId(token.chainId))
      .filter((token) => !isNativeCurrency(token))
      .forEach((token) => {
        unclaimedStore.updateUnclaimedBalance(token, aptos.address);
      });
  };

  const updateEvmBalance = () => {
    const {evm} = walletStore;
    if (!evm) return;
    getAllTokens()
      .filter((token) => isEvmChainId(token.chainId))
      .forEach((token) => {
        balanceStore.updateBalance(token, evm.address);
      });
  };

  const updateAptosBalance = () => {
    const {aptos} = walletStore;
    if (!aptos) return;
    const {address} = aptos;

    getAllTokens()
      .filter((token) => isAptosChainId(token.chainId))
      .forEach((token) => {
        balanceStore.updateBalance(token, address);
      });
  };

  const updateSolanaBalance = () => {
    const {solana} = walletStore;
    if (!solana) return;
    const {address} = solana;

    getAllTokens()
      .filter((token) => isSolanaChainId(token.chainId))
      .forEach((token) => {
        balanceStore.updateBalance(token, address);
      });
  };

  const updateMessageFee = () => {
    const {srcCurrency, dstCurrency} = bridgeStore.form;
    const {adapterParams} = bridgeStore;
    bridgeStore.updateMessageFee();
  };

  const updateExtraGas = () => {
    const {srcCurrency, dstCurrency} = bridgeStore.form;
    const {transferApi} = bridgeStore;
    bridgeStore.updateExtraGas();
  };

  const updateOutput = () => {
    const {dstCurrency} = bridgeStore.form;
    const {amount} = bridgeStore;
    bridgeStore.updateOutput();
  };

  const updateDstPrice = () => {
    const {srcChainId, dstChainId} = bridgeStore.form;
    if (!srcChainId) return;
    if (!dstChainId) return;
    lzConfigStore.updateDstConfig(srcChainId, dstChainId);
    lzConfigStore.updateDstPrice(srcChainId, dstChainId);
  };

  const updateTransferLimit = () => {
    const {srcCurrency, dstChainId} = bridgeStore.form;
    bridgeStore.updateLimit();
  };

  const updateDefaultAirdropAmount = () => {
    const {dstChainId} = bridgeStore.form;
    if (!dstChainId) return;
    airdropStore.updateDefaultAmount(dstChainId);
  };

  const updateAllowance = () => {
    const {evm} = walletStore;
    const {srcCurrency} = bridgeStore.form;
    const {transferApi} = bridgeStore;
    bridgeStore.updateAllowance(); //.then((allowance) => {;
  };

  const handlers = [
    // each in separate `thread`
    autorun(() => updateSolanaBalance()),
    autorun(() => updateEvmBalance()),
    autorun(() => updateAptosBalance()),
    autorun(() => updateUnclaimedBalance()),
    autorun(() => updateMessageFee()),
    autorun(() => updateExtraGas()),
    autorun(() => updateOutput()),
    autorun(() => updateDstPrice()),
    autorun(() => updateTransferLimit()),
    autorun(() => updateDefaultAirdropAmount()),
    autorun(() => updateAllowance()),
    // refresh
    interval(() => updateEvmBalance(), 30_000),
    interval(() => updateAptosBalance(), 30_000),
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

export const bridgeStore = new BridgeStore();
