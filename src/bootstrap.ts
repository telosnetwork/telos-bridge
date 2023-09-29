import {ChainId} from '@layerzerolabs/lz-sdk';
import {type AppConfig} from '@layerzerolabs/ui-app-config';
import {createWrappedTokenBridge} from '@layerzerolabs/ui-bridge-wrapped-token';
import {Currency, Token} from '@layerzerolabs/ui-core';
import {BalanceProvider__evm, DstConfigProvider__evm, ProviderFactory} from '@layerzerolabs/ui-evm';
import {uniqBy} from 'lodash-es';

import {DefaultAirdropProvider__evm} from '@/bridge/sdk/airdrop/DefaultAirdropProvider__evm';

import {bridgeStore, initBridgeStore} from '@/bridge/stores/bridgeStore';
import {createWallets} from '@/core/config/createWallets';
import {TokenListProvider} from '@/core/sdk/TokenListProvider';
import {airdropStore} from '@/core/stores/airdropStore';
import {balanceStore} from '@/core/stores/balanceStore';
import {fiatStore} from '@/core/stores/fiatStore';
import {lzConfigStore} from '@/core/stores/lzStore';
import {tokenStore} from '@/core/stores/tokenStore';
import {transactionStore} from '@/core/stores/transactionStore';
import {initTransactionStore} from '@/core/stores/transactionStore';
import {walletStore} from '@/core/stores/walletStore';

export async function bootstrap(lzAppConfig: AppConfig, providerFactory: ProviderFactory) {
  // Compile a list of unique currencies used in the app based on the bridge configuration
  const currencies = getCurrenciesFromLzAppConfig(lzAppConfig);

  // Compile a list of unique chains used in the app based on the bridge configuration
  const chains = getChainsFromLzAppConfig(lzAppConfig);
  const wallets = createWallets(chains);
  walletStore.addWallets(wallets);

  // tokens that have inconsistent symbols can be mapped to single symbol
  fiatStore.addSymbols({
    METIS: 'Metis',
    'm.USDT': 'USDT',
    USDt: 'USDT',
    'WOO.e': 'WOO',
    miMATIC: 'MAI',
  });

  // WrappedAssetBridge
  // https://github.com/LayerZero-Labs/wrapped-asset-bridge
  for (const wrappedAssetConfig of lzAppConfig.bridge.wrappedToken) {
    const apis = createWrappedTokenBridge(wrappedAssetConfig, providerFactory);
    for (const api of apis) {
      bridgeStore.addBridge(api);
    }
  }

  bridgeStore.addCurrencies(currencies);
  tokenStore.addProviders([
    //
    new TokenListProvider(),
  ]);

  lzConfigStore.addProviders([new DstConfigProvider__evm(providerFactory)]);
  balanceStore.addProviders([new BalanceProvider__evm(providerFactory)]);
  airdropStore.addProviders([new DefaultAirdropProvider__evm(providerFactory)]);

  if (typeof window !== 'undefined') {
    // Todo:
    // refactor to method on store
    initBridgeStore();
    initTransactionStore(transactionStore);
    tokenStore.updateTokens();
  }
}

/**
 * Creates a unique string representation of a currency,
 * useful for key prop on React components
 *
 * @param c Currency
 * @returns String
 */
function currencyKey(c: Currency): string {
  return [c.chainId, c.symbol, (c as Token).address ?? '0x', c.decimals].join(':');
}

/**
 * Creates a deduplicated list of currencies from AppConfig object
 *
 * The list will contain all Tokens & Coins from OFT, WrappedToken and Stargate
 * configurations
 *
 * @param lzAppConfig AppConfig
 * @returns Currency[]
 */
function getCurrenciesFromLzAppConfig(lzAppConfig: AppConfig): Currency[] {
  return uniqBy(
    lzAppConfig.bridge.wrappedToken.flatMap((c) => c.tokens.flat()),
    currencyKey,
  );
}

/**
 * Creates a list of deduplicated chain IDs from AppConfig object
 *
 * The list will contain all Tokens & Coins from OFT, WrappedToken
 * configurations
 *
 * @param lzAppConfig AppConfig
 * @returns Currency[]
 */
function getChainsFromLzAppConfig(lzAppConfig: AppConfig): ChainId[] {
  return Array.from(
    new Set(lzAppConfig.bridge.wrappedToken.flatMap((c) => c.tokens.flat()).map((t) => t.chainId)),
  );
}
