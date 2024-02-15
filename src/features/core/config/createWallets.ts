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

enum ChainListId {
  TELOS = 40,
  POLYGON = 137,
  ARBITRUM = 42161,
  BNB = 56,
  AVALANCHE = 43114
}

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
      [ChainListId.TELOS]: 'https://mainnet.telos.net:443/evm',
      [ChainListId.POLYGON]: 'https://polygon-rpc.com/',
      [ChainListId.ARBITRUM]: 'https://arb1.arbitrum.io/rpc',
      [ChainListId.BNB]: 'https://bsc-dataseed.binance.org/',
      [ChainListId.AVALANCHE]: 'https://api.avax.network/ext/bc/C/rpc',
    },
  });

  if (typeof window !== 'undefined') {
    Object.values(wallets).forEach((wallet) => wallet.autoConnect());
  }

  return wallets;
}
