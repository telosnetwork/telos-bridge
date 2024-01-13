import {
  Currency,
  CurrencyAmount,
  isAptosChainId,
  isEvmChainId,
  isSolanaChainId,
} from '@layerzerolabs/ui-core';
import {ActiveWallet} from '@layerzerolabs/ui-wallet';

import {balanceStore} from './balanceStore';
import {walletStore} from './walletStore';

export function getWalletForCurrency(currency: Currency): ActiveWallet<unknown> | undefined {
  const chainId = currency.chainId;
  if (isSolanaChainId(chainId)) return walletStore.solana;
  if (isAptosChainId(chainId)) return walletStore.aptos;
  if (isEvmChainId(chainId)) return walletStore.evm;
  return undefined;
}

export function getWalletBalance(currency?: Currency): CurrencyAmount | undefined {
  if (!currency) return undefined;
  const wallet = getWalletForCurrency(currency);
  if (!wallet?.address) return undefined;
  return balanceStore.getBalance(currency, wallet.address);
}
