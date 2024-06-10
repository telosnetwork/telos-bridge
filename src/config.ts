import {ChainId} from '@layerzerolabs/lz-sdk';
import {AppConfig, createAppConfig} from '@layerzerolabs/ui-app-config';
import {OnftBridgeConfig, OnftStandard} from '@layerzerolabs/ui-bridge-onft';
import {WrappedTokenBridgeConfig} from '@layerzerolabs/ui-bridge-wrapped-token';
import {Coin, Currency, Token} from '@layerzerolabs/ui-core';

import { bridgeAbi } from './abi/bridgeAbi';

export const TLOS_SYMBOL = 'TLOS';

export const wrapped_mainnet: WrappedTokenBridgeConfig = {
  version: 2,
  original: [
    {address: '0x9c5ebCbE531aA81bD82013aBF97401f5C6111d76', chainId: ChainId.ETHEREUM},
    {address: '0x9c5ebCbE531aA81bD82013aBF97401f5C6111d76', chainId: ChainId.ARBITRUM},
    {address: '0x9c5ebCbE531aA81bD82013aBF97401f5C6111d76', chainId: ChainId.BSC},
    {address: '0x9c5ebCbE531aA81bD82013aBF97401f5C6111d76', chainId: ChainId.POLYGON},
    {address: '0x9c5ebCbE531aA81bD82013aBF97401f5C6111d76', chainId: ChainId.AVALANCHE},
  ],
  wrapped: {
    address: '0x9c5ebCbE531aA81bD82013aBF97401f5C6111d76',
    chainId: ChainId.TELOS,
  },
  tokens: [
    [
      // USDC
      new Token(ChainId.TELOS, '0x8D97Cea50351Fb4329d591682b148D43a0C3611b', 6, 'USDC'),
      new Token(ChainId.ETHEREUM, '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', 6, 'USDC'),
      new Token(ChainId.ARBITRUM, '0xaf88d065e77c8cC2239327C5EDb3A432268e5831', 6, 'USDC'),
      new Token(ChainId.BSC, '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d', 18, 'USDC'),
    ],
    [
      // ETH
      new Coin(ChainId.ETHEREUM, 18, 'ETH'),
      new Coin(ChainId.ARBITRUM, 18, 'ETH'),
      // WETH
      new Token(ChainId.TELOS, '0xA0fB8cd450c8Fd3a11901876cD5f17eB47C6bc50', 18, 'ETH'),
      new Token(ChainId.POLYGON, '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619', 18, 'ETH'),
    ],
    [
      // USDT
      new Token(ChainId.TELOS, '0x975Ed13fa16857E83e7C493C7741D556eaaD4A3f', 6, 'USDT'),
      new Token(ChainId.ETHEREUM, '0xdAC17F958D2ee523a2206206994597C13D831ec7', 6, 'USDT'),
      new Token(ChainId.POLYGON, '0xc2132d05d31c914a87c6611c10748aeb04b58e8f', 6, 'USDT'),
    ],
    [
      // BTC.b
      new Token(ChainId.TELOS, '0x7627b27594bc71e6Ab0fCE755aE8931EB1E12DAC', 8, 'BTC.b'),
      new Token(ChainId.AVALANCHE, '0x152b9d0FdC40C096757F570A51E494bd4b943E50', 8, 'BTC.b'),
    ],
    [
      // BNB
      new Coin(ChainId.BSC, 18, 'BNB'),
      // WBNB
      new Token(ChainId.TELOS, '0x26Ed0F16e777C94A6FE798F9E20298034930Bae8', 18, 'BNB'),
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

const BANANA = {
  version: 2,
  tokens: [
    new Token(ChainId.TELOS, '0x7097Ee02465FB494841740B1a2b63c21Eed655E7', 4, 'BANANA'),
    new Token(ChainId.BSC, '0x7097Ee02465FB494841740B1a2b63c21Eed655E7', 4, 'BANANA'),
  ],
  proxy: [
    {
      chainId: ChainId.TELOS,
      address: '0x46893403C4aD778d7FDA0CdFCe355a0A7dba3333',
    },
    {
      chainId: ChainId.BSC,
      address: '0x7097Ee02465FB494841740B1a2b63c21Eed655E7'
    },
  ],
  fee: false,
  sharedDecimals: 4,
};

const LVC = {
  version: 1,
  tokens: [
    new Token(ChainId.ZKCONSENSYS, '0xcc22F6AA610D1b2a0e89EF228079cB3e1831b1D1', 18, 'LVC'),
    new Token(ChainId.TELOS, '0x7d637d806b750B9C9f5d8e4e3634AA6639246924', 18, 'LVC'),
  ],
  proxy: [
    {chainId: ChainId.TELOS, address: '0x7d637d806b750B9C9f5d8e4e3634AA6639246924'},
    {
      chainId: ChainId.ZKCONSENSYS,
      address: '0x48D9CDF4343d95E3B8d8F2BfcFdAE9d495f90cCA',
    },
  ],
  fee: false,
  sharedDecimals: 4,
};

const VC = {
  version: 1,
  tokens: [
    new Token(ChainId.TELOS, '0xcB61BC4aE1613abf8662B7003BaD0E2aa3F7D746', 18, 'VC'),
    new Token(ChainId.ZKSYNC, '0x99bBE51be7cCe6C8b84883148fD3D12aCe5787F2', 18, 'VC'),
  ],
  proxy: [
    {
      chainId: ChainId.TELOS,
      address: '0xcB61BC4aE1613abf8662B7003BaD0E2aa3F7D746',
    },
    {
      chainId: ChainId.ZKSYNC,
      address: '0x038b198152a83102F6380ee17d9Fbd69cde9797F'
    },
  ],
  fee: false,
  sharedDecimals: 4,
};

const RF = {
  version: 1,
  tokens: [
    new Token(ChainId.ZKSYNC, '0x5f7CBcb391d33988DAD74D6Fd683AadDA1123E4D', 18, 'RF'),
    new Token(ChainId.TELOS, '0xb99C43d3bce4c8Ad9B95a4A178B04a7391b2a6EB', 18, 'RF'),
  ],
  proxy: [
    {
      chainId: ChainId.TELOS,
      address: '0xb99C43d3bce4c8Ad9B95a4A178B04a7391b2a6EB',
    },
    {
      chainId: ChainId.ZKSYNC,
      address: '0xF5430284e7418891E3A0477D7598a3aA861D5c1D'
    },
  ],
  fee: false,
  sharedDecimals: 4,
};

export const TLOS  = {
  version: 2,
  tokens: [
    new Token(ChainId.ARBITRUM, '0x193f4A4a6ea24102F49b931DEeeb931f6E32405d', 18, TLOS_SYMBOL),
    new Token(ChainId.AVALANCHE, '0xed667dC80a45b77305Cc395DB56D997597Dc6DdD', 18, TLOS_SYMBOL),
    new Token(ChainId.BSC, '0x193f4A4a6ea24102F49b931DEeeb931f6E32405d', 18, TLOS_SYMBOL),
    new Token(ChainId.POLYGON, '0x193f4A4a6ea24102F49b931DEeeb931f6E32405d', 18, TLOS_SYMBOL),
    new Token(ChainId.ETHEREUM, '0x193f4A4a6ea24102F49b931DEeeb931f6E32405d', 18, TLOS_SYMBOL),
  ],
  proxy: [
    {chainId: ChainId.ARBITRUM, address: '0x193f4A4a6ea24102F49b931DEeeb931f6E32405d'},
    {chainId: ChainId.AVALANCHE, address: '0xed667dC80a45b77305Cc395DB56D997597Dc6DdD'},
    {chainId: ChainId.BSC, address: '0x193f4A4a6ea24102F49b931DEeeb931f6E32405d'},
    {chainId: ChainId.POLYGON, address: '0x193f4A4a6ea24102F49b931DEeeb931f6E32405d'},
    {chainId: ChainId.ETHEREUM, address: '0x193f4A4a6ea24102F49b931DEeeb931f6E32405d'},
    {chainId: ChainId.TELOS, address: '0x02Ea28694Ae65358Be92bAFeF5Cb8C211f33Db1A'}
  ],
  fee: false,
  sharedDecimals: 4,
}

export const appConfig: AppConfig = createAppConfig({
  bridge: {
    aptos: [],
    oft: [
      BANANA,
      LVC,
      VC,
      RF,
      TLOS
    ],
    wrappedToken: [
      wrapped_mainnet,
      // wrapped_testnet,
    ],
    onft: [
      // erc721_testnet,
      // erc1155_testnet,
    ],
  },
});

/***NATIVE OFT CONFIG***/

enum ChainListId {
  TELOS = 40,
  TELOS_TESTNET = 41,
}

type BridgeSettings = {
  address: string;
  chainId: ChainId;
  chainListId: ChainListId;
  rpc: string;
  abi: typeof bridgeAbi
}

export type ProxyConfig = {
  chainId: number;
  address: string;
}

type NativeOftConfig = {
  bridge: BridgeSettings;
  token: Currency;
  proxy: ProxyConfig;
}

export const telosNativeOft: NativeOftConfig = {
  bridge: {address: '0x9c5ebCbE531aA81bD82013aBF97401f5C6111d76', chainId: ChainId.TELOS, chainListId: ChainListId.TELOS, rpc: 'https://mainnet.telos.net/evm', abi: bridgeAbi},
  token: new Coin(ChainId.TELOS, 18, TLOS_SYMBOL),
  proxy: {chainId: ChainId.TELOS, address: '0x02Ea28694Ae65358Be92bAFeF5Cb8C211f33Db1A'}
}
