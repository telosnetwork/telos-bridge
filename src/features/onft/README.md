<p align="center">
  <a href="https://layerzero.network">
    <img alt="LayerZero" style="max-width: 500px" src="https://d3a2dpnnrypp5h.cloudfront.net/bridge-app/lz.png"/>
  </a>
</p>

<h1 align="center">Non-fungible Token Bridge Template</h1>

Everything you need to implement a working [ONFT](https://layerzero.gitbook.io/docs/evm-guides/layerzero-omnichain-contracts) bridge. The ONFT bridge accepts either [ONFT721](https://layerzero.gitbook.io/docs/evm-guides/layerzero-omnichain-contracts/onft/721) or [ONFT1155](https://layerzero.gitbook.io/docs/evm-guides/layerzero-omnichain-contracts/onft/1155).

## Bootstrap

<!-- Your ONFT configuration should live in the applicable folder in the `/sdk` folder, either `/sdk/erc721/config/{ENV}` or `/sdk/erc1155/config/{ENV}`. You will import these configurations in the [core bootstrapping](../core/README.md) and pass all your collection configs to `bootstrapOnft` in an array. -->

Your ONFT configuration will live in the main [config](../../config.ts) file and be included in the `lzAppConfig` in the `onft` field. Each collection is added to the [`onftStore`](stores/onftStore.tsx) via `addCollection` and we use `addBridge` with the provided bridging api.

## Collections

A valid collection should implement the `OnftBridgeConfig` type. This will include the network, contract address, and ONFT standard (ERC721 or ERC1155). As an example we have included the [Lil Pudgy's](https://opensea.io/collection/lilpudgys) collection with the following configuration

```ts
export const erc721_mainnet: OnftBridgeConfig = {
  contracts: [
    {
      standard: OnftStandard.ERC721,
      chainId: ChainId.POLYGON,
      address: '0x611747CC4576aAb44f602a65dF3557150C214493',
    },
    {
      standard: OnftStandard.ERC721,
      chainId: ChainId.ETHEREUM,
      address: '0x524cAB2ec69124574082676e6F654a18df49A048',
    },
    {
      standard: OnftStandard.ERC721,
      chainId: ChainId.BSC,
      address: '0x611747CC4576aAb44f602a65dF3557150C214493',
    },
    {
      standard: OnftStandard.ERC721,
      chainId: ChainId.ARBITRUM,
      address: '0x611747CC4576aAb44f602a65dF3557150C214493',
    },
  ],
  proxy: [
    {
      standard: OnftStandard.ERC721,
      chainId: ChainId.ETHEREUM,
      address: '0x611747CC4576aAb44f602a65dF3557150C214493',
    },
  ],
};
```

If you have your own ONFT collection and know your contract address information, you can swap out this configuration with your own token information and have your bridge up and running right away. If you don't have your own ONFT configuration yet, see the [LayerZero documentation](https://layerzero.gitbook.io/docs/evm-guides/layerzero-omnichain-contracts) for more information.
