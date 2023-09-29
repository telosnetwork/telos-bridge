import {ChainId} from '@layerzerolabs/lz-sdk';
import {DstConfig, DstConfigProvider, DstPrice} from '@layerzerolabs/ui-core';
import ExpiryMap from 'expiry-map';
import pMemoize from 'p-memoize';

export class CachedDstConfigProvider implements DstConfigProvider {
  dstConfigLookup: (srcChainId: ChainId, dstChainId: ChainId) => Promise<DstConfig>;
  dstPriceLookup: (srcChainId: ChainId, dstChainId: ChainId) => Promise<DstPrice>;
  isApplicable: (srcChainId: ChainId) => boolean;

  constructor(protected provider: DstConfigProvider, maxAge = 10_000) {
    this.dstConfigLookup = pMemoize(provider.dstConfigLookup.bind(provider), {
      cacheKey: (args) => JSON.stringify(args),
      cache: new ExpiryMap(maxAge),
    });
    this.dstPriceLookup = pMemoize(provider.dstPriceLookup.bind(provider), {
      cacheKey: (args) => JSON.stringify(args),
      cache: new ExpiryMap(maxAge),
    });
    this.isApplicable = provider.isApplicable.bind(provider);
  }
}
