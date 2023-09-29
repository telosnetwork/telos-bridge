import {BRIDGE_ADDRESS} from '@layerzerolabs/lz-aptos/dist/constants';
import {CoinType} from '@layerzerolabs/lz-aptos/dist/modules/apps/coin';
import {ChainId} from '@layerzerolabs/lz-sdk';
import {ChainStage} from '@layerzerolabs/lz-sdk';
import {AptosBridgeConfig} from '@layerzerolabs/ui-bridge-aptos';
import {getNativeCurrency, Token} from '@layerzerolabs/ui-core';

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const BRIDGE_DEPLOY_ACCOUNT = BRIDGE_ADDRESS[ChainStage.TESTNET]!;

const USDC_ADDRESS = {
  [ChainId.GOERLI]: '0x30c212b53714daf3739Ff607AaA8A0A18956f13c',
  [ChainId.FUJI]: '0x4A0D1092E9df255cf95D72834Ea9255132782318',
  [ChainId.APTOS_TESTNET]: `${BRIDGE_DEPLOY_ACCOUNT}::asset::${CoinType.USDC}`,
} as const;

const USDT_ADDRESS = {
  [ChainId.FUJI]: '0x134Dc38AE8C853D1aa2103d5047591acDAA16682',
  [ChainId.APTOS_TESTNET]: `${BRIDGE_DEPLOY_ACCOUNT}::asset::${CoinType.USDT}`,
} as const;

const WETH_ADDRESS = {
  [ChainId.GOERLI]: '0xcC0235a403E77C56d0F271054Ad8bD3ABcd21904',
  [ChainId.APTOS_TESTNET]: `${BRIDGE_DEPLOY_ACCOUNT}::asset::${CoinType.WETH}`,
} as const;

export const BRIDGE: AptosBridgeConfig = {
  tokens: [
    getNativeCurrency(ChainId.GOERLI),
    getNativeCurrency(ChainId.ARBITRUM_GOERLI),

    // WETH
    new Token(ChainId.GOERLI, WETH_ADDRESS[ChainId.GOERLI], 18, 'WETH', 'Wrapped Ether'),
    // prettier-ignore
    new Token(ChainId.APTOS_TESTNET, WETH_ADDRESS[ChainId.APTOS_TESTNET], 6, 'WETH', 'Wrapped Ether'),
    // USDC
    new Token(ChainId.GOERLI, USDC_ADDRESS[ChainId.GOERLI], 6, 'USDC', ' USD Coin'),
    new Token(ChainId.FUJI, USDC_ADDRESS[ChainId.FUJI], 6, 'USDC', ' USD Coin'),
    new Token(ChainId.APTOS_TESTNET, USDC_ADDRESS[ChainId.APTOS_TESTNET], 6, 'USDC', ' USD Coin'),
    // USDT
    new Token(ChainId.FUJI, USDT_ADDRESS[ChainId.FUJI], 6, 'USDT', 'USD Tether'),
    new Token(ChainId.APTOS_TESTNET, USDT_ADDRESS[ChainId.APTOS_TESTNET], 6, 'USDT', 'USD Tether'),
  ],
};
