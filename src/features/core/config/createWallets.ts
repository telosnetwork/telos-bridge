import {ChainId} from '@layerzerolabs/lz-sdk';
import {toEvmChainId} from '@layerzerolabs/ui-core';
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

export function createWallets(chains: ChainId[]): Record<string, Wallet<unknown>> {
  const wallets: Record<string, Wallet<unknown>> = {};

  // evm
  wallets.metamaskWallet = new MetaMaskWallet();
  wallets.coinbaseWallet = new CoinbaseWallet();
  wallets.coreWallet = new CoreWallet();
  wallets.braveWallet = new BraveWallet();
  wallets.phantomEvm = new PhantomWalletEvm();

  // const evmChains = chains.map(toEvmChainId) as ArrayOneOrMore<number>;

  // Get projectId from WalletConnect cloud https://docs.walletconnect.com/advanced/migration-from-v1.x/dapps#ethereum-provider
  // wallets.walletConnect = new WalletConnect({
  //   projectId: '',
  //   showQrModal: true,
  //   optionalChains: evmChains,
  // });

  if (typeof window !== 'undefined') {
    Object.values(wallets).forEach((wallet) => wallet.autoConnect());
  }

  return wallets;
}
