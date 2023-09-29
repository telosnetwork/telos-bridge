import {ProviderFactory} from '@layerzerolabs/ui-evm';
import {createContext} from 'react';

export const JsonRpcProviderContext = createContext<ProviderFactory>(() => {
  throw new Error(`EvmProviderContext missing`);
});
