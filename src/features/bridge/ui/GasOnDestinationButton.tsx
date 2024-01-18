import {observer} from 'mobx-react';

import {uiStore} from '@/core/stores/uiStore';
import {styled} from '@/core/ui/system';

import {bridgeStore} from '../stores/bridgeStore';
import { nativeBridgeStore } from '../stores/nativeBridgeStore';

export const GasOnDestinationButton = observer(() => {
  const {form, dstNativeAmount} = bridgeStore;
  return (
    <>
      {form.dstChainId ? (
        <Button onClick={uiStore.dstNativeAmountModal.open}>
          {dstNativeAmount?.equalTo(0) || !dstNativeAmount
            ? 'Add'
            : `${dstNativeAmount.toExact()} ${dstNativeAmount.currency.symbol}`}
        </Button>
      ) : (
        '--'
      )}
    </>
  );
});

const Button = styled('span', {name: 'GasOnDestinationButton'})(({theme}) => ({
  color: theme.palette.primary.main,
  cursor: 'pointer',
}));

// duplicated template to reference native OFT store

export const NativeGasOnDestinationButton = observer(() => {
  const {form, dstNativeAmount} = nativeBridgeStore;
  return (
    <>
      {form.dstChainId ? (
        <GasButton onClick={uiStore.dstNativeAmountModal.open}>
          {dstNativeAmount?.equalTo(0) || !dstNativeAmount
            ? 'Add'
            : `${dstNativeAmount.toExact()} ${dstNativeAmount.currency.symbol}`}
        </GasButton>
      ) : (
        '--'
      )}
    </>
  );
});

const GasButton = styled('span', {name: 'NativeGasOnDestinationButton'})(({theme}) => ({
  color: theme.palette.primary.main,
  cursor: 'pointer',
}));
