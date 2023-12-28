import {
  OnftMetadataProvider,
  RPC__ERC721MetadataProvider,
  RPC__ERC1155MetadataProvider,
  SimpleHash__MetadataProvider,
} from '@layerzerolabs/ui-bridge-onft';
import {createFailoverProviderFactory} from '@layerzerolabs/ui-evm';
import {useMemo} from 'react';

/**
 * A helper hook that construct an array of ONFTMetadataProviders
 * that can be passed directly to ONFTMetadataProvidersContext.Provider
 *
 * @returns ONFTMetadataProvider[]
 */
export const useOnftMetadataProviders = () => {
  return useMemo(() => {
    const providerFactory = createFailoverProviderFactory();

    // By default we'll use the RPC-based metadata providers
    //
    // These are the ones that call the contract and get the metadata directly from the chain
    // every time they are called. The downside of these is that the image we get is the full-size image
    // from the NFT which can be huge
    const providers: OnftMetadataProvider[] = [
      new RPC__ERC1155MetadataProvider(providerFactory),
      new RPC__ERC721MetadataProvider(providerFactory),
    ];

    // As an example of a third party metadata provider we'll use SimpleHash
    //
    // If you want to use SimpleHash, please sign up for thei API
    // and add NEXT_PUBLIC_SIMPLEHASH_API_KEY env variable into your .env file
    if (process.env.NEXT_PUBLIC_SIMPLEHASH_API_KEY) {
      providers.push(new SimpleHash__MetadataProvider(process.env.NEXT_PUBLIC_SIMPLEHASH_API_KEY));
    }

    return providers;
  }, []);
};
