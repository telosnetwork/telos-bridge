import {TokenListItem} from '@layerzerolabs/ui-core';

export const tokenList = createTokenList([
  // USDC
  ['USDC', 'USDC', '0x9aBbAd0228A4c948afdBD1364c3159D9Ac8f6FcB', 6, 'telos', 3408, 'usd-coin'],
  ['USDC', 'USDC', '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', 6, 'ethereum', 3408, 'usd-coin'],
  ['USDC', 'USDC', '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8', 6, 'arbitrum', 3408, 'usd-coin'],
  ['USDC', 'USDC', '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d', 18, 'bsc', 3408, 'usd-coin'],
  ['USDC', 'USDC', '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174', 6, 'polygon', 3408, 'usd-coin'],
  ['USDC', 'USDC', '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E', 6, 'avalanche', 3408, 'usd-coin'],

  // USDT
  ['USDT', 'USDT', '0xEf6f18604172a23152E5Ac96368f6dFab5Bc60d4', 6, 'telos', 825, 'tether'],
  ['USDT', 'USDT', '0xdAC17F958D2ee523a2206206994597C13D831ec7', 6, 'ethereum', 825, 'tether'],
  ['USDT', 'USDT', '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9', 6, 'arbitrum', 825, 'tether'],
  ['USDT', 'USDT', '0x55d398326f99059fF775485246999027B3197955', 18, 'bsc', 825, 'tether'],
  ['USDT', 'USDT', '0xc2132D05D31c914a87C6611C10748AEb04B58e8F', 6, 'polygon', 825, 'tether'],
  ['USDT', 'USDT', '0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7', 6, 'avalanche', 825, 'tether'],

  // WETH
  ['WETH', 'Wrapped Ether', '0xc54B4634a5a8bb1dCce6F98A15c533B2D185557E', 18, 'telos', 2396, 'weth'], // prettier-ignore
  ['WETH', 'Wrapped Ether', '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', 18, 'ethereum', 2396, 'weth'], // prettier-ignore
  ['WETH', 'Wrapped Ether', '0x82af49447d8a07e3bd95bd0d56f35241523fbab1', 18, 'arbitrum', 2396, 'weth'], // prettier-ignore

  // BTC.b
  ['BTC.b', 'BTC.b', '0x4c016A662A38ea4d16FB3048693bbF8088F42977', 8, 'telos', 1, 'bitcoin-avalanche-bridged-btc-b'], // prettier-ignore
  ['BTC.b', 'BTC.b', '0x2297aebd383787a160dd0d9f71508148769342e3', 8, 'ethereum', 1, 'bitcoin-avalanche-bridged-btc-b'], // prettier-ignore
  ['BTC.b', 'BTC.b', '0x2297aebd383787a160dd0d9f71508148769342e3', 8, 'bsc', 1, 'bitcoin-avalanche-bridged-btc-b'], // prettier-ignore
  ['BTC.b', 'BTC.b', '0x2297aebd383787a160dd0d9f71508148769342e3', 8, 'polygon', 1, 'bitcoin-avalanche-bridged-btc-b'], // prettier-ignore
  ['BTC.b', 'BTC.b', '0x2297aebd383787a160dd0d9f71508148769342e3', 8, 'arbitrum', 1, 'bitcoin-avalanche-bridged-btc-b'], // prettier-ignore
  ['BTC.b', 'BTC.b', '0x152b9d0fdc40c096757f570a51e494bd4b943e50', 8, 'avalanche', 1, 'bitcoin-avalanche-bridged-btc-b'], // prettier-ignore

  // WBNB
  ['WBNB', 'WBNB', '0x7aDed24d5A83Af69aaABfc3178dCE783dc1Ac29C', 6, 'telos', 1, 'wbnb'],
  ['WBNB', 'WBNB', '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c', 18, 'telos', 1, 'wbnb'],
]);

type TokenListItemTuple = [
  symbol: string,
  name: string,
  address: string | null,
  decimals: number,
  chainKey: string,
  coinMarketCapId: number | null,
  coinGeckoId?: string,
];

function createTokenList<T extends TokenListItemTuple>(
  items: T[],
): (TokenListItem & {coinMarketCapId?: number | string; coinGeckoId?: string})[] {
  return items.map(([symbol, name, address, decimals, chainKey, coinMarketCapId, coinGeckoId]) => ({
    symbol,
    chainKey,
    decimals,
    address,
    name,
    //
    price: {},
    coinMarketCapId: coinMarketCapId ?? undefined,
    coinGeckoId: coinGeckoId ?? undefined,
  }));
}
