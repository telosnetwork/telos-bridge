import {OnftTokenAmount} from '@layerzerolabs/ui-bridge-onft';
import {sortBy, uniqBy} from 'lodash-es';
import {useMemo} from 'react';

import {onftStore} from '@/onft/stores/onftStore';

import {usePendingAssets} from './usePendingAssets';

export function useAllAssets(): OnftTokenAmount[] {
  const {balances, srcAddress} = onftStore;
  const onChainAssets = srcAddress ? balances.get(srcAddress) ?? NO_ASSETS : NO_ASSETS;
  const pendingAssets = usePendingAssets();

  // TODO provide logic for multiple nfts (symbol)
  const allAssets = useMemo(
    () =>
      sortBy(
        uniqBy([...onChainAssets.filter((i) => i.amount > 0), ...pendingAssets], (asset) =>
          [asset.token.id, asset.token.contract.address, asset.token.contract.chainId].join(':'),
        ),
        (asset) => asset.token.id,
      ),
    [onChainAssets, pendingAssets],
  );

  return allAssets;
}

const NO_ASSETS: OnftTokenAmount[] = [];
