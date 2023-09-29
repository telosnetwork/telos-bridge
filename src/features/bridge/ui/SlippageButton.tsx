import {observer} from 'mobx-react';

import {bridgeStore} from '@/bridge/stores/bridgeStore';
import {uiStore} from '@/core/stores/uiStore';
import {styled} from '@/core/ui/system';

export const SlippageButton = observer(() => {
  const {slippage} = bridgeStore;
  return (
    <>
      <Button onClick={uiStore.slippageModal.open}>
        {slippage ? slippage.toFixed() : 'Edit'}%{' '}
      </Button>
    </>
  );
});

const Button = styled('span', {name: 'EditSlippageButton'})(({theme}) => ({
  color: theme.palette.primary.main,
  cursor: 'pointer',
}));
