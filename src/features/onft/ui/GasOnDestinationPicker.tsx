import {getNativeCurrency} from '@layerzerolabs/ui-core';
import {observer} from 'mobx-react';
import * as React from 'react';

import {Button} from '@/core/ui/Button';
import {CurrencyIcon} from '@/core/ui/CurrencyIcon';
import {Icon} from '@/core/ui/Icon';
import {Input} from '@/core/ui/Input';
import {Selector} from '@/core/ui/Selector';
import {SlideInTitle} from '@/core/ui/SlideIn';
import {Switch} from '@/core/ui/Switch';
import {Box, styled} from '@/core/ui/system';

import {DstNativeAmount, onftStore} from '../stores/onftStore';

const GasPickerRoot = styled(Box, {name: 'DstPickerRoot'})<{open?: boolean}>(
  ({open: shown, theme}) => ({
    position: 'absolute',
    top: shown ? 0 : '100%',
    bottom: 0,
    right: 0,
    left: 0,
    backgroundColor: theme.palette.background.paper,
    zIndex: 10,
    transition: 'top 200ms ease-out',
    padding: '12px 16px',
    ...theme.typography.p2,
  }),
);

type GasOnDestinationPickerProps = {
  open?: boolean;
  onClose: () => void;
};

const options: string[] = [DstNativeAmount.NONE, DstNativeAmount.DEFAULT, DstNativeAmount.MAX];

export const GasOnDestinationPicker = observer(
  ({open: open, onClose}: GasOnDestinationPickerProps) => {
    const {form, dstNativeAmount} = onftStore;
    const dstNativeAmountInput = options.includes(form.dstNativeAmount)
      ? dstNativeAmount?.toExact()
      : form.dstNativeAmount;
    const isCustom = !options.includes(form.dstNativeAmount);
    const dstNativeCost = onftStore.messageFee?.nativeFee;
    const dstNative = form.dstChainId ? getNativeCurrency(form.dstChainId) : undefined;

    const customGasInputRef = React.useRef<HTMLInputElement>(null);
    const handleCustomSwitch = (checked: boolean) => {
      if (checked && customGasInputRef.current) {
        customGasInputRef.current.focus();
        onftStore.setDstNativeAmount('');
      } else {
        onftStore.setDstNativeAmount(DstNativeAmount.DEFAULT);
      }
    };

    return (
      <GasPickerRoot open={open}>
        <SlideInTitle
          sx={{mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}
        >
          Get ready for your destination
          <Button variant='incognito' onClick={onClose}>
            <Icon type='close' size={16} />
          </Button>
        </SlideInTitle>
        <Box sx={{height: '100%', display: 'flex', flexDirection: 'column'}}>
          <Box color='text.secondary'>
            Choose the amount of{' '}
            <Box component='span' color='primary.main'>
              ETH
            </Box>{' '}
            you want to swap.
            <br />
            The total amount you’ll pay in your wallet includes the gas you’ll be airdropping to
            your destination.
          </Box>
          <Box sx={{mt: 4, mb: 2}}>
            <Selector selection={form.dstNativeAmount}>
              <Selector.Option
                onClick={() => onftStore.setDstNativeAmount(DstNativeAmount.NONE)}
                value={DstNativeAmount.NONE}
              >
                None
              </Selector.Option>
              <Selector.Option
                onClick={() => onftStore.setDstNativeAmount(DstNativeAmount.DEFAULT)}
                value={DstNativeAmount.DEFAULT}
              >
                Medium
              </Selector.Option>
              <Selector.Option
                onClick={() => onftStore.setDstNativeAmount(DstNativeAmount.MAX)}
                value={DstNativeAmount.MAX}
              >
                Max
              </Selector.Option>
            </Selector>
          </Box>
          <Box sx={{display: 'flex', justifyContent: 'space-between'}}>
            <Box color='text.secondary'>Custom amount</Box>
            <Switch checked={isCustom} onCheckedChange={handleCustomSwitch} />
          </Box>
          <Input
            onChange={(e) => onftStore.setDstNativeAmount(e.target.value)}
            size='md'
            value={dstNativeAmountInput}
            sx={{mt: 2, width: '100%'}}
            startAdornment={<CurrencyIcon size={16} currency={dstNative} />}
            ref={customGasInputRef}
            endAdornment={
              <Button
                variant='secondary'
                size='xs'
                sx={{px: 1}}
                onClick={() => onftStore.setDstNativeAmount(DstNativeAmount.MAX)}
              >
                Max
              </Button>
            }
          />
          <Box sx={{mt: 'auto', display: 'flex', justifyContent: 'space-between'}}>
            <Box color='text.secondary'>Cost</Box>
            <Box>
              {dstNativeCost?.toSignificant()} {dstNativeCost?.currency.symbol}
            </Box>
          </Box>
        </Box>
      </GasPickerRoot>
    );
  },
);
