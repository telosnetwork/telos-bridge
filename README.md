<p align="center">
  <a href="https://layerzero.network">
    <img alt="LayerZero" style="max-width: 500px" src="https://d3a2dpnnrypp5h.cloudfront.net/bridge-app/lz.png"/>
  </a>
</p>

<h1 align="center">LayerZero Bridge Example dApp</h1>

<!-- Deploy buttons -->

<p align="center">
  <a href="https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FLayerZero-Labs%2Ffactory%2Ftree%2Fexamples%2Fbridge-app&demo-title=LayerZero%20dApp&demo-description=Showcase%20dApp%20for%20LayerZero%20omnichain%20interoperability%20protocol&demo-url=https%3A%2F%2Ffactory.layerzero.network%2Fbridge&demo-image=https%3A%2F%2Flayerzero.network%2Ficons%2Fshare.png">
    <img src="https://d3a2dpnnrypp5h.cloudfront.net/bridge-app/deploy-to-vercel.svg" alt="Deploy with Vercel"/>
  </a>
  <a href="https://app.netlify.com/start/deploy?repository=https%3A%2F%2Fgithub.com%2FLayerZero-Labs%2Ffactory&base=examples%2Fbridge-app">
    <img src="https://d3a2dpnnrypp5h.cloudfront.net/bridge-app/deploy-to-netlify.svg" alt="Deploy to Netlify"/>
  </a>
</p>

An example LayerZero dApp built on top of Next.JS

## Quick Start

The easiest way to create a dApp for your LayerZero tokens is to use our [`create-lz-app`](https://www.npmjs.com/package/create-lz-app) utility:

```bash
npx create-lz-app ./my-project-directory
```

This utility will walk you through the process of dApp configuration and will create a working Next.js application you can then deploy using e.g. Vercel or Netlify.

If want to contribute to the development of the shared packages, you can also clone this repository and run the example app (see [the repository home page](https://github.com/LayerZero-Labs/factory) for more details):

```sh
# Clone the repository - this also includes reusable packages
git clone https://github.com/LayerZero-Labs/factory.git && cd factory

# Install required dependencies
yarn

# set up .env
cp .env.example .env

# After a fresh clone, you'll need to run an initial build
yarn build

# To only run the example app (on port 3009)
yarn dev --filter=bridge-app

# To also make changes to the reusable packages
yarn dev
```

## Project Structure

The example app is organized by feature. You’ll find verticals for the [fungible token bridge](src/features/bridge/README.md) and [non-fungible token (ONFT) bridge](src/features/onft/README.md) in the features folder, along with [core](src/features/core/README.md) pieces used in each. Within each vertical folder you’ll find stores, components, and configuration specific to that use case.

```
bridge-app
├── README.md
├── node_modules
├── package.json
├── tsconfig.json
├── public
│   └── static
│        └── icons
└── src
    ├── config.ts
    ├── bootstrap.tsx
    ├── features
    |  ├──core
    |  ├──bridge
    |  └──onft
    └── pages
      ├── bridge.tsx
      ├── oft.tsx
      ├── onft.tsx
      └── _app.tsx
```

The config file defines and exports an object of type `AppConfig`. This will describe every token you want to support. The bootstrap file takes that config as an input and hydrates the stores with data and apis to handle bridging all the defined assets. If you are coming from `create-lz-app`, your config file will contain exactly what you configured in the cli steps, or the default configuration if you chose that option.

Your bridge will be fully functional out of the box for any bridge type. We have the following Next.js pages:

- [bridge](http://localhost:3009/bridge): Transfer between any valid pair of registered tokens.
- [OFT](http://localhost:3009/oft): A simplified transfer form designed to swap just one type of OFT between supported networks.
- [ONFT](http://localhost:3009/onft): Transfer [ONFTs](https://layerzero.gitbook.io/docs/evm-guides/layerzero-omnichain-contracts) across supported networks.

You can include or delete any of these pages to customize the exact application you want to build. For information on how to simplify your repo see the relevant section below.

## Creating a Fungible Token Bridge

Your configuration should include some fungible tokens, either OFTs, wrapped assets, or tokens supported by our Aptos or Stargate contracts. In this case, your bootstrapping step will set up the `bridgeStore` with everything it needs, including access to the supported currencies and apis to execute transfers.

If you are not interested in including an ONFT bridge, you can completely remove the [onft](./src/features/onft/) folder, as well as the [/onft page](./src/pages/onft.tsx). Next you will have to remove imports from the `onft` folder and refrences to the `onftStore` in [bootstrap.ts](./src/bootstrap.ts), everything should be under the heading `// ONFT ERC721 & ERC1155`. Once that's done, feel free to remove dependencies related to the ONFT bridge, namely `@layerzerolabs/ui-bridge-onft`. You will also want to delete the ONFT tab from the `AppHeader` component in your [layout](./src/features/core/ui/Layout.tsx).

By default we also include an [OFT](http://localhost:3009/oft) page. This uses the same `bridgeStore` as the full transfer form, so no code needs to be removed. You may remove the [/oft page](./src/pages/oft.tsx) and OFT tab from the [layout](./src/features/core/ui/Layout.tsx).

## Creating a simple OFT Bridge

The [OFT](http://localhost:3009/oft) page is a simplified version of the full transfer form. This page uses the first `oft` from your `AppConfig` and is a good choice if you are only interested in transferring one token between its supported networks.

If you are only interested in this page you may remove the [onft](./src/features/onft/) folder, as well as the [/onft page](./src/pages/onft.tsx). The same `bridgeStore` that supports the full transfer page is used in the OFT page so it should not be modified. Similar to above, you will have to remove imports from the `onft` folder and references to the `onftStore` in [bootstrap.ts](./src/bootstrap.ts), and can remove the `@layerzerolabs/ui-bridge-onft` dependency.

## Creating a Non-Fungible Token Bridge

If your `AppConfig` includes any items in the `onft` field, the bootstrapping step will automatically configure your `onftStore` to support transfers of all your collections across their respective supported networks. The scaffold will also include a store and UI for bridging fungible tokens, if you don't need this you can completely remove the [bridge](./src/features/bridge/) folder, as well as the `Bridge` and `OFT` tabs from the `AppHeader` component in your [layout](./src/features/core/ui/Layout.tsx). You will then have to remove imports from the `bridge` folder and references to the `bridgeStore` from [bootstrap.ts](./src/bootstrap.ts), and can remove all dependencies related to fungible token bridging.

### ONFT Balances Providers

To read ONFT balances for your collection you will likely need to implement your own balance provider. We recommend using a third party indexing service like [Alchemy](https://docs.alchemy.com/reference/nft-api-quickstart), [Infura](https://www.infura.io/platform/nft-api), or [Simple Hash](https://docs.simplehash.com/reference/overview).

Your custom provider should implement the [`ONFTBalanceProvider`](https://github.com/LayerZero-Labs/ui-monorepo/blob/main/packages/ui-bridge-onft/src/balance/OnftBalanceProvider.ts) interface

```ts
interface OnftBalanceProvider {
  supports(contract: OnftContract): boolean;
  getAssets(contract: OnftContract, owner: string): Promise<OnftTokenAmount[]>;
}
```

Where `supports` returns `true` if the contract address belongs to your collection, and `getAssets` should request assets from your third party integration. Once implemented, you can swap the default balance provider in [`bootstrap.ts`](src/bootstrap.ts) to complete your configuration.

### Wallet Configuration

The example app ships with support for the following wallets

- Petra
- Fewcha
- Martian
- Wallet Connect
- Metamask
- Phantom
- Coinbase Wallet
- Core
- Pontem
- Brave
- PhantomEvm
- Solflare
- Coinbase Wallet Solana

You can enable any combination of these in the [`createWallet`](src/features/core/config/createWallets.ts) helper by adding or removing from the wallets array.

### RPC Provider

The core bootstrap is where we initialize a `providerFactory`. In this context we're referring to rpc node providers, and the factory maps a `chainId` to a `FailoverProvider`. See the `ui-evm` documentation for more details, in short we connect to RPC nodes based on a weighted score, and fallback to another option in case of multiple failures.

The `providerFactory` is used in some the the generic store providers and is sent to the app specific bootstrapping steps.

## Disclaimer

DISCLAIMER: THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY
KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE AND
NON-INFRINGEMENT. IN NO EVENT SHALL THE COPYRIGHT HOLDERS OR ANYONE
DISTRIBUTING THE SOFTWARE BE LIABLE FOR ANY DAMAGES OR OTHER
LIABILITY, WHETHER IN CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT
OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

## Deployment Links

Main Net: [https://bridge.telos.net](https://bridge.telos.net)  [![Netlify Status](https://api.netlify.com/api/v1/badges/0b94e491-064e-4673-a45d-0a31b506c3cd/deploy-status)](https://app.netlify.com/sites/telos-bridge/deploys)

Test Net: [https://telos-bridge-testnet.netlify.app](https://telos-bridge-testnet.netlify.app)   [![Netlify Status](https://api.netlify.com/api/v1/badges/6c67c3cd-036f-4744-9633-037f82436efc/deploy-status)](https://app.netlify.com/sites/telos-bridge-testnet/deploys)
