import {ChainId} from '@layerzerolabs/lz-sdk';
import {Currency, CurrencyAmount, DefaultAirdropProvider, getNativeCurrency} from '@layerzerolabs/ui-core';
import assert from 'assert';
import {flow, makeAutoObservable, ObservableMap} from 'mobx';

export class AirdropStore {
  defaultAmount = new ObservableMap<string, CurrencyAmount>();
  providers: DefaultAirdropProvider[] = [];
  constructor() {
    makeAutoObservable(this, {}, {autoBind: true});
  }
  getDefault(dstChainId: ChainId): CurrencyAmount | undefined {
    const defaultGasOnDst = this.defaultAmount.get(String(dstChainId));
 
    // set default gas on destination value to .05 TLOS (max allowed) if unset
    if (defaultGasOnDst?.numerator.toString() === '0' && dstChainId === ChainId.TELOS){
      const dstNativeCurrency = getNativeCurrency(ChainId.TELOS);
      const defaultAmount = CurrencyAmount.fromRawAmount(dstNativeCurrency, 50000000000000000); 
      this.defaultAmount.set(String(ChainId.TELOS), defaultAmount);
      return defaultAmount;
    }
 
    return defaultGasOnDst;
  }
  addProviders(providers: DefaultAirdropProvider[]) {
    this.providers.push(...providers);
  }
  updateDefaultAmount: (dstChainId: ChainId) => Promise<void> = flow(function* (
    this: AirdropStore,
    dstChainId,
  ) {
    const provider = this.providers.find((p) => p.supports(dstChainId));
    assert(provider);
    const amount = yield provider.estimateDefaultAirdrop(dstChainId);
    this.defaultAmount.set(String(dstChainId), amount);
    return amount;
  });
}

export const airdropStore = new AirdropStore();
