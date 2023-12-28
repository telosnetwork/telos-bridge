import {OnftToken} from '@layerzerolabs/ui-bridge-onft';
import {useQuery} from '@tanstack/react-query';
import assert from 'assert';
import {useContext} from 'react';

import {OnftMetadataProvidersContext} from '../providers/OnftMetadataProvidersContext';

export function useAssetMetadata(asset?: OnftToken) {
  const providers = useContext(OnftMetadataProvidersContext);
  const provider = asset
    ? providers.find((provider) => provider.supports(asset?.contract))
    : undefined;

  return useQuery({
    enabled: !!asset && !!provider,
    queryKey: [asset?.contract.chainId, asset?.contract.address, asset?.id.toString()],
    queryFn: () => {
      assert(asset);
      assert(provider);

      return provider.getMetadata(asset);
    },
    refetchOnWindowFocus: false,
    refetchInterval: 3600 * 24,
  });
}
