import {ChainId} from '@layerzerolabs/lz-sdk';
import { toEvmChainId } from '@layerzerolabs/ui-core';
import {Wallet} from '@layerzerolabs/ui-wallet';
import {
  BraveWallet,
  CoinbaseWallet,
  CoreWallet,
  MetaMaskWallet,
  PhantomWallet as PhantomWalletEvm,
  WalletConnect,
} from '@layerzerolabs/ui-wallet-evm';

type ArrayOneOrMore<T> = {
  0: T;
} & Array<T>;

const TELOS_MAINNET_CHAIN_ID = 40;
const POLYGON_MAINNET_CHAIN_ID = 137;
const ARBITRUM_ONE_MAINNET_CHAIN_ID = 42161;
const BNB_MAINNET_CHAIN_ID = 56;
const AVALANCHE_MAINNET_CHAIN_ID = 43114;

export function createWallets(chains: ChainId[]): Record<string, Wallet<unknown>> {
  const wallets: Record<string, Wallet<unknown>> = {};

  // evm
  wallets.metamaskWallet = new MetaMaskWallet();
  wallets.coinbaseWallet = new CoinbaseWallet();
  wallets.coreWallet = new CoreWallet();
  wallets.braveWallet = new BraveWallet();
  wallets.phantomEvm = new PhantomWalletEvm();

  const evmChains = chains.map(toEvmChainId) as ArrayOneOrMore<number>;

  wallets.walletConnect = new WalletConnect({
    projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID as string,
    showQrModal: true,
    optionalChains: evmChains,
    rpcMap: {
      [TELOS_MAINNET_CHAIN_ID]: 'https://mainnet.telos.net:443/evm',
      [POLYGON_MAINNET_CHAIN_ID]: 'https://polygon-rpc.com/',
      [ARBITRUM_ONE_MAINNET_CHAIN_ID]: 'https://arb1.arbitrum.io/rpc',
      [BNB_MAINNET_CHAIN_ID]: 'https://bsc-dataseed.binance.org/',
      [AVALANCHE_MAINNET_CHAIN_ID]: 'https://api.avax.network/ext/bc/C/rpc',
    },
  });

  if (typeof window !== 'undefined') {
    Object.values(wallets).forEach((wallet) => wallet.autoConnect());
  }

  return wallets;
}
