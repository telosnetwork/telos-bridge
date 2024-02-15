import {ChainId} from '@layerzerolabs/lz-sdk';
import {Wallet} from '@layerzerolabs/ui-wallet';
import {
  BraveWallet,
  CoinbaseWallet,
  CoreWallet,
  InjectedWallet,
  MetaMaskWallet,
  PhantomWallet as PhantomWalletEvm,
  ProviderIdentityFlag,
} from '@layerzerolabs/ui-wallet-evm';

type ArrayOneOrMore<T> = {
  0: T;
} & Array<T>;

const SAFEPAL = 'SafePal';

// if icon is not available at https://icons-ckg.pages.dev/lz-dark/wallets/<wallet-name-to-lower>.svg 
// e.g. https://icons-ckg.pages.dev/lz-dark/wallets/metamask.svg, use provided icon url in WalletIcon component
export const useIconUrl = [SAFEPAL]
class SafePal extends InjectedWallet {
  type = SAFEPAL;
  identityFlag = ProviderIdentityFlag.SafePal;
  readonly url = "https://www.safepal.com/";
  readonly icon = "https://pbs.twimg.com/profile_images/1676254262505123840/NhRRmBnl_400x400.png";
}

export function createWallets(chains: ChainId[]): Record<string, Wallet<unknown>> {
  const wallets: Record<string, Wallet<unknown>> = {};

  // evm
  wallets.metamaskWallet = new MetaMaskWallet();
  wallets.coinbaseWallet = new CoinbaseWallet();
  wallets.coreWallet = new CoreWallet();
  wallets.braveWallet = new BraveWallet();
  wallets.phantomEvm = new PhantomWalletEvm();
  wallets.safePal = new SafePal();

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
