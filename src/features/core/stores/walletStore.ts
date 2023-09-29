import {AptosSigner} from '@layerzerolabs/ui-aptos';
import {ChainType} from '@layerzerolabs/ui-core';
import {SolanaSigner} from '@layerzerolabs/ui-solana';
import {ActiveWallet, Wallet} from '@layerzerolabs/ui-wallet';
import {Signer as EvmSigner} from 'ethers';
import {makeAutoObservable} from 'mobx';

export class WalletStore {
  public wallets: Record<string, Wallet<unknown>> = {};

  constructor() {
    makeAutoObservable(this);
  }

  // returns true if all wallet types from provided wallets are connected
  get isConnected(): boolean {
    const wallets = Object.values(this.wallets);
    const chainTypes = Array.from(new Set(wallets.map((w) => w.chainType)));
    return chainTypes.every((chainType) =>
      wallets.some((w) => w.chainType === chainType && w.isConnected),
    );
  }

  get active(): ActiveWallet<unknown>[] {
    const active: ActiveWallet<unknown>[] = [];
    for (const wallet of Object.values(this.wallets)) {
      if (isActive(wallet)) active.push(wallet);
    }
    return active;
  }

  get available() {
    return Object.values(this.wallets).filter((w) => w.isAvailable);
  }

  get evm(): ActiveWallet<EvmSigner> | undefined {
    return this.active.find((w) => w.chainType === ChainType.EVM) as ActiveWallet<EvmSigner>;
  }

  get solana(): ActiveWallet<SolanaSigner> | undefined {
    return this.active.find((w) => w.chainType === ChainType.SOLANA) as ActiveWallet<SolanaSigner>;
  }

  get aptos(): ActiveWallet<AptosSigner> | undefined {
    return this.active.find((w) => w.chainType === ChainType.APTOS) as ActiveWallet<AptosSigner>;
  }

  addWallets(wallets: Record<string, Wallet<unknown>>) {
    this.wallets = wallets;
  }
}

function isActive<T = unknown>(wallet: Wallet<T>): wallet is ActiveWallet<T> {
  return Boolean(wallet.chainKey && wallet.address && wallet.isConnected && wallet.signer);
}

export const walletStore = new WalletStore();
