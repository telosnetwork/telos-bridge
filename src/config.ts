import {ChainId} from '@layerzerolabs/lz-sdk';
import {AppConfig, createAppConfig} from '@layerzerolabs/ui-app-config';

import {WrappedTokenBridgeConfig} from '@layerzerolabs/ui-bridge-wrapped-token';
import {Token} from '@layerzerolabs/ui-core';

import {OnftBridgeConfig, OnftStandard} from '@layerzerolabs/ui-bridge-onft';

export const wrapped_mainnet: WrappedTokenBridgeConfig = {
  version: 2,
  original: [
    {address: '0x826efc453E95bE36Af2bf867D36f9241c8BeeE16', chainId: ChainId.ETHEREUM},
    {address: '0x826efc453E95bE36Af2bf867D36f9241c8BeeE16', chainId: ChainId.ARBITRUM},
    {address: '0x826efc453E95bE36Af2bf867D36f9241c8BeeE16', chainId: ChainId.BSC},
    {address: '0x826efc453E95bE36Af2bf867D36f9241c8BeeE16', chainId: ChainId.POLYGON},
    {address: '0x826efc453E95bE36Af2bf867D36f9241c8BeeE16', chainId: ChainId.AVALANCHE},
  ],
  wrapped: {
    address: '0x826efc453E95bE36Af2bf867D36f9241c8BeeE16',
    chainId: ChainId.TELOS,
  },
  tokens: [
    [
      // USDC
      new Token(ChainId.TELOS, '0x9aBbAd0228A4c948afdBD1364c3159D9Ac8f6FcB', 6, 'USDC'),
      new Token(ChainId.ETHEREUM, '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', 6, 'USDC'),
      new Token(ChainId.ARBITRUM, '0xaf88d065e77c8cC2239327C5EDb3A432268e5831', 6, 'USDC'),
      new Token(ChainId.BSC, '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d', 18, 'USDC'),
    ],
    [
      // WETH
      new Token(ChainId.TELOS, '0xc54B4634a5a8bb1dCce6F98A15c533B2D185557E', 18, 'WETH'),
      new Token(ChainId.ETHEREUM, '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', 18, 'WETH'),
      new Token(ChainId.ARBITRUM, '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1', 18, 'WETH'),
      new Token(ChainId.POLYGON, '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619', 18, 'WETH'),
    ],
    [
      // USDT
      new Token(ChainId.TELOS, '0xEf6f18604172a23152E5Ac96368f6dFab5Bc60d4', 6, 'USDT'),
      new Token(ChainId.ETHEREUM, '0xdAC17F958D2ee523a2206206994597C13D831ec7', 6, 'USDT'),
      new Token(ChainId.POLYGON, '0xc2132d05d31c914a87c6611c10748aeb04b58e8f', 6, 'USDT'),
    ],
    [
      // BTC.b
      new Token(ChainId.TELOS, '0x4c016A662A38ea4d16FB3048693bbF8088F42977', 8, 'BTC.b'),
      new Token(ChainId.AVALANCHE, '0x152b9d0FdC40C096757F570A51E494bd4b943E50', 8, 'BTC.b'),
    ],
    [
      // WBNB
      new Token(ChainId.TELOS, '0x7aDed24d5A83Af69aaABfc3178dCE783dc1Ac29C', 18, 'WBNB'),
      new Token(ChainId.BSC, '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c', 18, 'WBNB'),
    ],
  ],
};

export const wrapped_testnet: WrappedTokenBridgeConfig = {
  version: 2,
  original: [
    {address: '0xBCD4a2c19DC010d1Da2D7985CF18A5251774dF46', chainId: ChainId.GOERLI},
    {address: '0xbF625D717de1a6e5a8446424CF08D4269D51ab96', chainId: ChainId.ARBITRUM_GOERLI},
    {address: '0x8168C0704Ff49F8e89AF45f04f898144C459b156', chainId: ChainId.BSC_TESTNET},
    {address: '0x0c372d3f89d1ce9f11a50b98374f7846a37f7d99', chainId: ChainId.MUMBAI},
    {address: '0x2a3a50f458AaAae618C54C1670fD49e338b795c2', chainId: ChainId.FUJI},
  ],
  wrapped: {
    address: '0x137d4e9C2431A3DCBa6e615E9438F2c558353a17',
    chainId: ChainId.TELOS_TESTNET,
  },
  tokens: [
    [
      // USDC
      new Token(ChainId.GOERLI, '0x31190a205713Bd825a0c237E26f67CE89B5C4dD8', 6, 'USDC'),
      new Token(ChainId.ARBITRUM_GOERLI, '0x6463C73809EE3F85BeCD0a82c55cb808474101D0', 6, 'USDC'),
      new Token(ChainId.BSC_TESTNET, '0x9D5859A95A0b9d7739fCBec82c800B56ef143fe9', 6, 'USDC'),
      new Token(ChainId.TELOS_TESTNET, '0x22FdA4Efc62d72f0E0804e205c2c858D5c2cF959', 6, 'USDC'),
    ],
    [
      // WETH
      new Token(ChainId.TELOS_TESTNET, '0xe83F5959A58cb21E3B3B1682a898143C3f4AFEe0', 18, 'WETH'),
    ],
    [
      // USDT
      new Token(ChainId.GOERLI, '0xdddacBBFa219b9579596886032b826552c8E9810', 6, 'USDT'),
      new Token(ChainId.MUMBAI, '0x6cc732BB947569e5560F380c8d3E24844bA2DDb3', 6, 'USDT'),
      new Token(ChainId.TELOS_TESTNET, '0xe1aFB545B5701D884a674d90b31927BBd0fcA380', 6, 'USDT'),
    ],
    [
      // BTC.b
      new Token(ChainId.FUJI, '0x576d96722c79aB0469BE3a632521d100de0AE3E3', 8, 'BTC.b'),
      new Token(ChainId.TELOS_TESTNET, '0xDbCE5f022203c36578F5D751E9c5e669AF35C62B', 8, 'BTC.b'),
    ],
    [
      // WBNB
      new Token(ChainId.TELOS_TESTNET, '0x15a7cad43E5F24d1B08fDE151CE00D1cf360f6C7', 6, 'WBNB'),
    ],
  ],
};

export const erc721_testnet: OnftBridgeConfig = {
  contracts: [
    {
      standard: OnftStandard.ERC721,
      address: '0xcb196127954be0b0555da5dc51432e3f8499c809',
      chainId: 10102,
      symbol: 'LZ721',
      name: 'LayerZero Example ERC721',
    },
    {
      standard: OnftStandard.ERC721,
      address: '0x27918c6f5f8aed9a6dd714685daf88b582596a58',
      chainId: 10106,
      symbol: 'LZ721',
      name: 'LayerZero Example ERC721',
    },
    {
      standard: OnftStandard.ERC721,
      address: '0xD8D015FbA330A12490BdAe2642b6a75F8a0bB5E5',
      chainId: 10143,
      symbol: 'LZ721',
      name: 'LayerZero Example ERC721',
    },
  ],
  proxy: [
    {
      chainId: 10143,
      address: '0x84F041620FC54d43f18AdEe0745C5DCc84AFaC50',
    },
  ],
};

export const erc1155_testnet: OnftBridgeConfig = {
  contracts: [
    {
      address: '0xFc13c28024Ac57B0FbfF311FccFF2dA452B7Ff26',
      chainId: ChainId.FUJI,
      standard: OnftStandard.ERC1155,
    },
    {
      address: '0xf9fe722d05DA63265ACd909fe01BbB49701c2506',
      chainId: ChainId.BSC_TESTNET,
      standard: OnftStandard.ERC1155,
    },
    {
      address: '0x9748733678AB402e3B0464213D7f629709A87260',
      chainId: ChainId.ARBITRUM_GOERLI,
      standard: OnftStandard.ERC1155,
    },
  ],
  proxy: [
    {
      address: '0xeBc2aFc3DE72a17f42962E912d03DbA5ee8af898',
      chainId: ChainId.FUJI,
    },
  ],
};

const PEPE_MAINNET = {
  version: 2,
  tokens: [
    new Token(ChainId.ARBITRUM, '0x25d887Ce7a35172C62FeBFD67a1856F20FaEbB00', 18, 'PEPE'),
    new Token(ChainId.ETHEREUM, '0x6982508145454Ce325dDbE47a25d4ec3d2311933', 18, 'PEPE'),
    new Token(ChainId.BSC, '0x25d887Ce7a35172C62FeBFD67a1856F20FaEbB00', 18, 'PEPE'),
  ],
  proxy: [
    {
      chainId: ChainId.ETHEREUM,
      address: '0x25d887Ce7a35172C62FeBFD67a1856F20FaEbB00',
    },
  ],
  fee: true,
  sharedDecimals: 4,
};

export const appConfig: AppConfig = createAppConfig({
  bridge: {
    aptos: [
      //
    ],
    oft: [
      //
      // PEPE_MAINNET
    ],
    wrappedToken: [
      //
      wrapped_mainnet,
      // wrapped_testnet,
    ],
    onft: [
      //
      erc721_testnet,
      erc1155_testnet,
    ],
  },
});
