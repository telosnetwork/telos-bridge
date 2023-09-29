import {observer} from 'mobx-react';

import {uiStore} from '@/core/stores/uiStore';
import {styled} from '@/core/ui/system';

import {bridgeStore} from '../stores/bridgeStore';

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
