import {ChainId} from '@layerzerolabs/lz-sdk';
import {chainKeyToEndpointId} from '@layerzerolabs/ui-core';
import {useEffect} from 'react';

import {bridgeStore,CurrencyOption } from '@/bridge/stores/bridgeStore';
import {balanceStore} from '@/core/stores/balanceStore';
import {walletStore} from '@/core/stores/walletStore';

import { TLOS_SYMBOL } from '../../../config';


export function useDefaultSrcCurrency() {
  const {address, chainKey} = walletStore.evm ?? {};
  const {form} = bridgeStore;

  // todo: assign tokens to chainKey instead of chainId
  const srcChainId = chainKey ? chainKeyToEndpointId(chainKey, 1) : undefined;

  // are balances from current chain loaded
  const isReady =
    address &&
    bridgeStore.currencies.every((currency) =>
      currency.chainId === srcChainId ? balanceStore.getBalance(currency, address) : true,
    );

  useEffect(() => {
    if (!srcChainId) return;
    if (form.srcChainId) return;
    bridgeStore.setSrcChainId(srcChainId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, srcChainId]);

  useEffect(() => {
    if (!isReady) return;
    if (!address) return;
    if (!form.srcChainId) return;
    if (form.srcCurrency) return;
    if (form.dstCurrency) return;
    const {srcCurrencyOptions} = bridgeStore;

    // set Telos EVM TLOS as default
    const telosNative = srcCurrencyOptions.find((option: CurrencyOption) => option.currency.chainId === ChainId.TELOS && option.currency.symbol === TLOS_SYMBOL)
    if (telosNative) {
      if (srcChainId !== ChainId.TELOS){
        bridgeStore.setSrcChainId(ChainId.TELOS);
      }
      bridgeStore.setSrcCurrency(telosNative.currency);
    }
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [address, form.srcChainId, srcChainId, isReady]);

  /*** set max balance as default token ***/
  // useEffect(() => {
  //   if (!isReady) return;
  //   if (!address) return;
  //   if (!form.srcChainId) return;
  //   if (form.srcCurrency) return;
  //   if (form.dstCurrency) return;
  //   const {srcCurrencyOptions} = bridgeStore;
  //   const balances = srcCurrencyOptions
  //     .filter((o) => o.currency.chainId === srcChainId)
  //     .map(({currency}) => balanceStore.getBalance(currency, address))
  //     .flatMap((balance) => (balance ? [balance] : []));

  //   const maxBalance = maxBy(balances, (b) => {
  //     try {
  //       return parseFloat(b.toExact());
  //     } catch {
  //       return 0;
  //     }
  //   });
  //   if (maxBalance) {
  //     bridgeStore.setSrcCurrency(maxBalance.currency);
  //   }
  //   /* eslint-disable-next-line react-hooks/exhaustive-deps */
  // }, [address, form.srcChainId, srcChainId, isReady]);
}
