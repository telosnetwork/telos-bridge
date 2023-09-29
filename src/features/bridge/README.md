<p align="center">
  <a href="https://layerzero.network">
    <img alt="LayerZero" style="max-width: 500px" src="https://d3a2dpnnrypp5h.cloudfront.net/bridge-app/lz.png"/>
  </a>
</p>

<h1 align="center">Fungible Token Bridge Template</h1>

Everything you need to implement a bridge dApp is included here. Out of the box the example app can bridge JOE, PEPE, BTC.b, and STG between Arbitrum, Avalanche, BSC, Ethereum, Optimism, and Polygon.

## Overview

In the primary [bootstrapping step](../../bootstrap.tsx) we initialize the [`bridgeStore`](stores/bridgeStore.tsx). This store contains the application logic that powers the main form. This includes maintaining form inputs, gathering bridging prerequisite data, and handling form error checking.

To configure a bridge you will need to register currencies that will be available for transfer via `bridgeStore.addCurrency` and set api that will support source/destination pairs via `bridgeStore.addBridge`.

### Currencies

A currency is an object with type either [Token](https://github.com/LayerZero-Labs/ui-monorepo/blob/main/packages/ui-core/src/currency/token.ts) or [Coin](https://github.com/LayerZero-Labs/ui-monorepo/blob/main/packages/ui-core/src/currency/coin.ts).

Once registered, your form will be populated with the currency options and pull balances from connected wallets. To enable bridging, continue to the [Strategies](#Strategies) section, and register at least one api that supports a pair of source and destination tokens from your currencies configuration.

The template includes a handful of currencies out of the box in the following categories.

### OFT

The [OFT standard](https://tome.app/layerzero-labs/oft-1-pager-v0-cldwqsurl0cysbz3wkog5hlxi) enables any fungible token to natively across chains. Any properly deployed OFT can be added to the bridge template and will be transferable with out of the box configuration. For more information on how to define and deploy your own OFT, see the [LayerZero documentation](https://layerzero.gitbook.io/docs/evm-guides/layerzero-omnichain-contracts).

The template includes configuration for some known OFTs (JOE, BTC, STG, PEPE). To choose from the default OFTs or define your own OFTs to support in your bridge app, modify the `oft` field in the `lzAppConfig` in [config.ts](../../config.ts).

To configure a bridge for your own OFT, gather the following

- Your OFT version, 1 or 2
- All of the networks you'd like to support along with the token address on each network.
- The proxy token address and network if you have one. The proxy contract wraps an existing ERC20, a fresh OFT may not need a proxy contract.
- The token symbol
- The token decimals

If version 2 then also

- Whether or not to include a fee
- The shared decimals

#### For V1

```js
{
  version: 1,
  tokens: [
    new Token(chainId, tokenAddress, tokenDecimals, tokenSymbol)
    ...
  ],
  proxy: [
    {
      chainId: proxyChainId,
      address: proxyContractAddress
    }
  ],
};
```

#### For V2

```js
{
  version: 2,
  tokens: [
    new Token(chainId, tokenAddress, tokenDecimals, tokenSymbol)
    ...
  ],
  proxy: [
    {
      chainId: proxyChainId,
      address: proxyContractAddress
    }
  ],
  fee: true | false,
  sharedDecimals: tokenSharedDecimals,
};
```

### Wrapped Assets

Out of the box the example app will support any token with properly deployed [Wrapped Asset](https://github.com/LayerZero-Labs/wrapped-asset-bridge) contracts.

With your deployed `OriginalTokenBridge`, `WrappedTokenBridge`, and `WrappedERC20` contracts, you can simply replace the `wrapped_mainnet` and/or `wrapped_testnet` constants in [config.ts](../../config.ts), or include your own list of `type WrappedTokenBridgeConfig` in the `wrappedAsset` field of the `lzAppConfig`.

```js
export const wrapped_mainnet: WrappedTokenBridgeConfig = {
  original: [
    {address: OriginalTokenBridge.address, chainId: OriginalTokenBridge.chainId},
    ...
  ],
  wrapped: {address: WrappedTokenBridge.address, chainId: WrappedTokenBridge.chainId},
  tokens: [
    new Token(chainId, WrappedERC20.address, decimals, symbol),
    ...
  ],
};
```
