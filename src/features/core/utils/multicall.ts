import {providers} from '@0xsequence/multicall';
import {ChainId} from '@layerzerolabs/lz-sdk';
import {ProviderFactory} from '@layerzerolabs/ui-evm';
import memoize from 'micro-memoize';

// deployed by layerzero
export const multicallUtils: Partial<Record<ChainId, string>> = {
  [ChainId.FANTOM]: '0xD4CC286D0a66C9a47111C085F7fd1A0256feE27a',
  [ChainId.METIS]: '0x954eb2A2df3b4Bd45048583925EE9b9E3bB5F488',
  // [ChainId.TELOS]: '0xd6930Fe78c44759014cb3b51f3042B406aa7239B' // testnet
  [ChainId.TELOS]: '0x2983CC20CE4Fb2C12F1F56B7a3f153a43C0A5307' // mainnet
};

export const createMulticallProviderFactory = (providerFactory: ProviderFactory) => {
  const multicallProviderFactory: ProviderFactory = memoize((chainId: ChainId) => {
    const provider = providerFactory(chainId);
    // by default MulticallProvider ensures multicall contract is deployed at `0xd130B43062D875a4B7aF3f8fc036Bc6e9D3E1B3E`
    // if the chain is not supported - it will forward calls to underlying provider
    const contract = multicallUtils[chainId] ?? '0xd130B43062D875a4B7aF3f8fc036Bc6e9D3E1B3E';

    return new providers.MulticallProvider(provider, {contract});
  });

  return multicallProviderFactory;
};
