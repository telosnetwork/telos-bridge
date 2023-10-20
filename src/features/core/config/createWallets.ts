import {ChainId} from '@layerzerolabs/lz-sdk';
import {Wallet} from '@layerzerolabs/ui-wallet';
import {
  BraveWallet,
  CoinbaseWallet,
  CoreWallet,
  MetaMaskWallet,
  PhantomWallet as PhantomWalletEvm,
} from '@layerzerolabs/ui-wallet-evm';

type ArrayOneOrMore<T> = {
  0: T;
} & Array<T>;

const TELOS_MAINNET_CHAIN_ID = 40;

export function createWallets(chains: ChainId[]): Record<string, Wallet<unknown>> {
  const wallets: Record<string, Wallet<unknown>> = {};

  // evm
  wallets.metamaskWallet = new MetaMaskWallet();
  wallets.coinbaseWallet = new CoinbaseWallet();
  wallets.coreWallet = new CoreWallet();
  wallets.braveWallet = new BraveWallet();
  wallets.phantomEvm = new PhantomWalletEvm();

  const evmChains = chains.map(toEvmChainId) as ArrayOneOrMore<number>;

  // Get projectId from WalletConnect cloud https://docs.walletconnect.com/advanced/migration-from-v1.x/dapps#ethereum-provider
  wallets.walletConnect = new WalletConnect({
    projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID as string, // eztodo add this to readme
    showQrModal: true,
    optionalChains: evmChains,
    rpcMap: {
      [TELOS_MAINNET_CHAIN_ID]: 'https://mainnet.telos.net:443/evm',
    },
  });

  if (typeof window !== 'undefined') {
    Object.values(wallets).forEach((wallet) => wallet.autoConnect());
  }

  return wallets;
}
