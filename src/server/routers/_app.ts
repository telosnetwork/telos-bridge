import {
  chainKeyToEndpointId,
  Coin,
  FiatCurrency,
  Token,
  TokenListItem,
} from '@layerzerolabs/ui-core';
import {
  CoinGeckoEndpoint,
  //
  CoinGeckoPriceProvider,
  CoinMarketCapEndpoint,
  CoinMarketCapPriceProvider,
} from '@layerzerolabs/ui-price-sdk';

import {tokenList} from '../../tokenList';
import {procedure, router} from '../trpc';

const cmcProvider = new CoinMarketCapPriceProvider(
  {
    apiKey: 'b54bcf4d-1bca-4e8e-9a24-22ff2c3d462c',
    endpoint: CoinMarketCapEndpoint.SANDBOX,
  },
  tokenList.filter((t) => t.coinMarketCapId) as any,
);

const cgProvider = new CoinGeckoPriceProvider(
  {
    endpoint: CoinGeckoEndpoint.PUBLIC,
  },
  tokenList.filter((t) => t.coinGeckoId) as any,
);

const provider = cgProvider;

export const appRouter = router({
  tokens: procedure.query(async (opts) => {
    const tokens = await Promise.all(
      tokenList
        .filter((t) => t.chainKey !== 'aptos')
        .map(async (item) => {
          const chainId = chainKeyToEndpointId(item.chainKey, 1);

          const {address} = item;

          const currency = address
            ? Token.from({...item, address, chainId})
            : Coin.from({...item, chainId});

          const usd = await provider
            .getCurrentPrice(currency, FiatCurrency.USD)
            // ignore errors
            .catch((e) => console.error(e));

          const details: TokenListItem = {
            chainKey: item.chainKey,
            decimals: item.decimals,
            symbol: item.symbol,
            name: item.name,
            address: item.address,
            icon: item.coinMarketCapId
              ? `https://s2.coinmarketcap.com/static/img/coins/128x128/${item.coinMarketCapId}.png`
              : undefined,
            price: {
              USD: usd ?? null,
            },
          };

          return details;
        }),
    );
    return tokens;
  }),
});

// export type definition of API
export type AppRouter = typeof appRouter;
