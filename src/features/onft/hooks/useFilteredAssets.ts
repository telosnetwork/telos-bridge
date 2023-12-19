import {OnftTokenAmount} from '@layerzerolabs/ui-bridge-onft';

import {onftStore} from '../stores/onftStore';

export const useFilteredAssets = <T extends OnftTokenAmount>(assets: T[]): T[] => {
  const selectedChainId = onftStore.filters.chainId;
  if (selectedChainId == null) return assets;

  return assets.filter(({token}) => token.contract.chainId === selectedChainId);
};
