import {getNativeCurrency} from '@layerzerolabs/ui-core';
import {observer} from 'mobx-react';
import React from 'react';

import {bridgeStore, DstNativeAmount} from '@/bridge/stores/bridgeStore';
import {Button} from '@/core/ui/Button';
import {CurrencyIcon} from '@/core/ui/CurrencyIcon';
import {Input} from '@/core/ui/Input';
import {Modal, ModalProps} from '@/core/ui/Modal';
import {Selector} from '@/core/ui/Selector';
import {Switch} from '@/core/ui/Switch';
import {Box} from '@/core/ui/system';

type GasOnDestinationModalProps = Omit<ModalProps, 'title' | 'children'>;

const options: string[] = [DstNativeAmount.DEFAULT, DstNativeAmount.MAX];

export const GasOnDestinationModal = observer((props: GasOnDestinationModalProps) => {
  const {form} = bridgeStore;
  const {dstNativeAmount, maxDstNativeAmount} = bridgeStore;
  const dstNativeAmountInput =
    (options.includes(form.dstNativeAmount)
      ? bridgeStore.dstNativeAmount?.toExact()
      : form.dstNativeAmount) ?? '';
  const dstNativeAmountError =
    maxDstNativeAmount && dstNativeAmount?.greaterThan(maxDstNativeAmount)
      ? `Requested airdrop exceeds max: ${maxDstNativeAmount.toExact()} ${
          maxDstNativeAmount.currency.symbol
        }`
      : undefined;
  const isCustom = !options.includes(form.dstNativeAmount) && dstNativeAmountInput !== '0';
  const dstNativeCost = bridgeStore.messageFee?.nativeFee;
  const dstNative = form.dstChainId ? getNativeCurrency(form.dstChainId) : undefined;

  const customGasInputRef = React.useRef<HTMLInputElement>(null);
  const handleCustomSwitch = (checked: boolean) => {
    if (checked && customGasInputRef.current) {
      customGasInputRef.current.focus();
      bridgeStore.setDstNativeAmount('');
    } else {
      bridgeStore.setDstNativeAmount(DstNativeAmount.DEFAULT);
    }
  };

  return (
    <Modal title='Get ready for your destination' {...props}>
      <Box sx={{p: 2, height: '100%', display: 'flex', flexDirection: 'column'}}>
        <Box typography='p3' color='text.secondary'>
          Choose the amount of{' '}
          <Box component='span' color='primary.main'>
            {dstNative?.symbol}
          </Box>{' '}
          you want to receive at the destination. The total amount you&apos;ll pay in your wallet includes the gas you&apos;ll be airdropping.
        </Box>
        <Box sx={{mt: 4, mb: 2}}>
          <Selector selection={form.dstNativeAmount}>
            <Selector.Option onClick={() => bridgeStore.setDstNativeAmount('0')} value={'0'}>
              None
            </Selector.Option>
            <Selector.Option
              onClick={() => bridgeStore.setDstNativeAmount(DstNativeAmount.DEFAULT)}
              value={DstNativeAmount.DEFAULT}
            >
              Medium
            </Selector.Option>
            <Selector.Option
              onClick={() => bridgeStore.setDstNativeAmount(DstNativeAmount.MAX)}
              value={DstNativeAmount.MAX}
            >
              Max
            </Selector.Option>
          </Selector>
        </Box>
        <Box sx={{display: 'flex', justifyContent: 'space-between'}}>
          <Box color='text.secondary' typography='p2'>
            Custom amount
          </Box>
          <Switch checked={isCustom} onCheckedChange={handleCustomSwitch} />
        </Box>
        <Input
          onChange={(e) => bridgeStore.setDstNativeAmount(e.target.value)}
          size='md'
          error={dstNativeAmountError}
          value={dstNativeAmountInput}
          sx={{mt: 2, width: '100%', boxSizing: 'border-box'}}
          ref={customGasInputRef}
          startAdornment={<CurrencyIcon size={16} currency={dstNative} />}
          endAdornment={
            <Button
              variant='tertiary'
              size='xs'
              onClick={() => bridgeStore.setDstNativeAmount(DstNativeAmount.MAX)}
            >
              Max
            </Button>
          }
        />
        <Box sx={{mt: 'auto', display: 'flex', justifyContent: 'space-between'}}>
          <Box component='span' color='text.secondary' typography='p3'>
            Cost
          </Box>
          <Box component='span' typography='p3' color='text.primary'>
            {dstNativeCost?.toSignificant()} {dstNativeCost?.currency.symbol}
          </Box>
        </Box>
      </Box>
    </Modal>
  );
});
