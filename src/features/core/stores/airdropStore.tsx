import {ChainId} from '@layerzerolabs/lz-sdk';
import {CurrencyAmount, DefaultAirdropProvider} from '@layerzerolabs/ui-core';
import assert from 'assert';
import {flow, makeAutoObservable, ObservableMap} from 'mobx';

export class AirdropStore {
  defaultAmount = new ObservableMap<string, CurrencyAmount>();
  providers: DefaultAirdropProvider[] = [];
  constructor() {
    makeAutoObservable(this, {}, {autoBind: true});
  }
  getDefault(dstChainId: ChainId): CurrencyAmount | undefined {
    return this.defaultAmount.get(String(dstChainId));
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
