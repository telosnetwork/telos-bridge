import {useEffect} from 'react';

import {DstNativeAmount, onftStore} from '../stores/onftStore';

const LOCAL_GAS_ON_DST_KEY = 'gas-on-dst--1155';
export const useLocalGasOnDestination = () => {
  useEffect(() => {
    try {
      const storedValue = window.localStorage.getItem(LOCAL_GAS_ON_DST_KEY) as
        | DstNativeAmount
        | undefined;
      if (storedValue) {
        onftStore.setDstNativeAmount(storedValue);
      }
    } catch {
      //pass
    }
  }, []);

  const {dstNativeAmount} = onftStore.form;
  useEffect(() => {
    try {
      window.localStorage.setItem(LOCAL_GAS_ON_DST_KEY, dstNativeAmount);
    } catch {
      // pass
    }
  }, [dstNativeAmount]);
};
