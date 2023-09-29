import {ChainId} from '@layerzerolabs/lz-sdk';
import {getNativeCurrency, isEvmChainId, toCurrencyAmount} from '@layerzerolabs/ui-core';
import {useQuery} from '@tanstack/react-query';
import assert from 'assert';
import {useContext} from 'react';

import {JsonRpcProviderContext} from '../context/JsonRpcProviderContext';

export function useGasPrice(chainId?: ChainId) {
  const providerFactory = useContext(JsonRpcProviderContext);

  const result = useQuery({
    queryKey: ['gasPrice', chainId],
    enabled: Boolean(chainId && isEvmChainId(chainId)),
    queryFn: async () => {
      assert(chainId, 'No chainId for gas price');

      const provider = providerFactory(chainId);
      const native = getNativeCurrency(chainId);
      const wei = await provider.getGasPrice();

      return toCurrencyAmount(native, wei);
    },
    refetchInterval: 10000,
  });
  return result.data;
}
