import {ChainId} from '@layerzerolabs/lz-sdk';
import { toEvmChainId } from '@layerzerolabs/ui-core';
import {Wallet} from '@layerzerolabs/ui-wallet';
import {
  CoinbaseWallet,
  CoreWallet,
  ExternalWallet,
  InjectedWallet,
  MetaMaskWallet,
  PhantomWallet as PhantomWalletEvm,
  ProviderIdentityFlag,
  WalletConnect,
} from '@layerzerolabs/ui-wallet-evm';
import { isMobile } from '../utils/platform';

type ArrayOneOrMore<T> = {
  0: T;
} & Array<T>;

export enum WalletType {
  SAFEPAL = 'SafePal',
  PHANTOM = 'Phantom',
  METAMASK = 'MetaMask',
  COINBASE = 'CoinBase',
  BRAVE = 'Brave',
  CORE = 'Core'
}

// if icon is not available at https://icons-ckg.pages.dev/lz-dark/wallets/<wallet-name-to-lower>.svg 
// e.g. https://icons-ckg.pages.dev/lz-dark/wallets/metamask.svg, 
// add wallet type to list to use the provided icon url  
export const useIconUrl = [WalletType.SAFEPAL as string]
class SafePal extends InjectedWallet {
  type = WalletType.SAFEPAL;
  identityFlag = ProviderIdentityFlag.SafePal;
  readonly url = "https://www.safepal.com/";
  readonly icon = "https://pbs.twimg.com/profile_images/1676254262505123840/NhRRmBnl_400x400.png";
}

export class BraveWallet extends ExternalWallet {
  type = WalletType.BRAVE;
  identityFlag = ProviderIdentityFlag.BraveWallet;
  readonly url = "https://brave.com/wallet/";
  readonly icon = "https://icons-ckg.pages.dev/lz-light/wallets/brave.svg";
}

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
  // Brave wallet only supported on mobile at the moment, see https://github.com/telosnetwork/teloscan/issues/544
  if (isMobile()){
    wallets.braveWallet = new BraveWallet();
  }
  wallets.phantomEvm = new PhantomWalletEvm();
  wallets.safePal = new SafePal();

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
