import {observer} from 'mobx-react';

import {bridgeStore} from '@/bridge/stores/bridgeStore';
import {useGasPrice} from '@/core/hooks/useGasPrice';
import {Box, styled} from '@/core/ui/system';

export const GasPriceText = styled('div')(({theme}) => ({
  ...theme.typography.p2,
  marginTop: 8,
  color: theme.palette.text.primary,
}));

export const GasPrice = observer(() => {
  const gasPrice = useGasPrice(bridgeStore.form.srcChainId);
  if (!gasPrice) return null;
  return (
    <>
      <GasPriceText>
        Gas Price:{' '}
        <Box component='span' color='success.main'>
          {gasPrice.multiply(1e9).toFixed(0)}
        </Box>
      </GasPriceText>
    </>
  );
});
