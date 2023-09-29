import {CurrencyAmount, DstConfig, DstConfigProvider, DstPrice} from '@layerzerolabs/ui-core';
import {flow, makeAutoObservable, ObservableMap} from 'mobx';

export class LzConfigStore {
  dstPriceItems = new ObservableMap<string, DstPrice>();
  dstConfigItems = new ObservableMap<string, DstConfig>();
  providers: DstConfigProvider[] = [];

  constructor() {
    makeAutoObservable(this, {}, {autoBind: true});
  }

  addProviders(providers: DstConfigProvider[]) {
    this.providers.push(...providers);
  }

  protected toKey(srcChainId: number, dstChainId: number) {
    return JSON.stringify({srcChainId, dstChainId});
  }

  getDstPrice(srcChainId: number, dstChainId: number): DstPrice | undefined {
    return this.dstPriceItems.get(this.toKey(srcChainId, dstChainId));
  }
  getDstConfig(srcChainId: number, dstChainId: number): DstConfig | undefined {
    return this.dstConfigItems.get(this.toKey(srcChainId, dstChainId));
  }
  getMaxDstNativeAmount(srcChainId: number, dstChainId: number): CurrencyAmount | undefined {
    return this.getDstConfig(srcChainId, dstChainId)?.dstNativeAmtCap;
  }

  protected getProvider(srcChainId: number) {
    return this.providers.find((p) => p.isApplicable(srcChainId));
  }

  updateDstPrice = flow(function* (this: LzConfigStore, srcChainId: number, dstChainId: number) {
    const provider = this.getProvider(srcChainId);

    if (!provider) throw new Error(`No provider found for chainId: ${srcChainId}`);

    const price: DstPrice = yield provider.dstPriceLookup(srcChainId, dstChainId);
    this.dstPriceItems.set(this.toKey(srcChainId, dstChainId), price);
    return price;
  });

  updateDstConfig = flow(function* (this: LzConfigStore, srcChainId: number, dstChainId: number) {
    const provider = this.getProvider(srcChainId);

    if (!provider) return undefined;

    const config: DstConfig = yield provider.dstConfigLookup(srcChainId, dstChainId);
    this.dstConfigItems.set(this.toKey(srcChainId, dstChainId), config);
    return config;
  });

  updateAll = (chainIds: number[]) => {
    const paths: {srcChainId: number; dstChainId: number}[] = [];
    for (const srcChainId of chainIds) {
      for (const dstChainId of chainIds) {
        if (srcChainId !== dstChainId) paths.push({srcChainId, dstChainId});
      }
    }

    return Promise.allSettled(
      paths.map((path) => {
        this.updateDstPrice(path.srcChainId, path.dstChainId);
        this.updateDstConfig(path.srcChainId, path.dstChainId);
      }),
    );
  };
}

export const lzConfigStore = new LzConfigStore();
