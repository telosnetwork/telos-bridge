import {Percent} from '@layerzerolabs/ui-core';
import {observer} from 'mobx-react';
import React, {useRef} from 'react';

import {bridgeStore} from '@/bridge/stores/bridgeStore';
import {Input} from '@/core/ui/Input';
import {Modal, ModalProps} from '@/core/ui/Modal';
import {Selector} from '@/core/ui/Selector';
import {Switch} from '@/core/ui/Switch';
import {Box, styled} from '@/core/ui/system';

type SlippageModalProps = Omit<ModalProps, 'title' | 'children'>;

enum SlippageAmount {
  HALF_PERCENT = '0.5',
  ONE_PERCENT = '1.00',
  FIVE_PERCENT = '5.00',
}

const slippageAmounts: string[] = [
  SlippageAmount.HALF_PERCENT,
  SlippageAmount.ONE_PERCENT,
  SlippageAmount.FIVE_PERCENT,
];

const isSlippageAmount = (value: string): value is SlippageAmount =>
  slippageAmounts.includes(value);

export const SlippageModal = observer((props: SlippageModalProps) => {
  const {form, slippage} = bridgeStore;

  const formAmountAsSlippageAmount = isSlippageAmount(form.slippage) ? form.slippage : undefined;

  const lastSelectedSlippageAmountRef = useRef<SlippageAmount>(
    formAmountAsSlippageAmount ?? SlippageAmount.FIVE_PERCENT,
  );

  if (formAmountAsSlippageAmount) {
    // We will update it everytime we have a DstNativeAmount in the form
    lastSelectedSlippageAmountRef.current = formAmountAsSlippageAmount;
  }

  // We'll use this to revert to the last valid value of slippage in case the user closes
  // the dialog with an invalid value in it
  const lastValidSlippageAmountRef = useRef<Percent | undefined>(slippage);
  if (slippage) lastValidSlippageAmountRef.current = slippage;

  // Now that we no longer need the typed version, we can just create a boolean
  // out of formAmountAsDstNativeAmount
  //
  // Do you like how the name is just one letter from the original?
  const formAmountIsSlippageAmount = formAmountAsSlippageAmount != null;

  const slippageInput = formAmountIsSlippageAmount ? slippage?.toFixed(2) : form.slippage;

  const handleToggleCustomAmount = () => {
    bridgeStore.setSlippage(
      formAmountIsSlippageAmount ? slippageInput ?? '0' : lastSelectedSlippageAmountRef.current,
    );
  };

  const handleClose = () => {
    if (slippage == null && form.slippage != null) {
      bridgeStore.setSlippage(lastValidSlippageAmountRef.current?.toFixed(2) ?? '');
    }
    props.onClose();
  };

  const isCustom = !isSlippageAmount(form.slippage);

  return (
    <Modal title='Slippage tolerance' {...props} onClose={handleClose}>
      <Box sx={{p: 2, height: '100%', display: 'flex', flexDirection: 'column'}}>
        <Box typography='p3' color='text.secondary'>
          Your transaction will revert if the price change unfavorably by more than this percentage.
        </Box>
        <Box sx={{mt: 4, mb: 2}}>
          <Selector selection={form.slippage}>
            {slippageAmounts.map((amount) => (
              <Selector.Option
                onClick={() => bridgeStore.setSlippage(amount)}
                value={amount}
                key={amount}
              >
                {amount}%
              </Selector.Option>
            ))}
          </Selector>
        </Box>
        <Box sx={{display: 'flex', justifyContent: 'space-between'}}>
          <Box color='text.secondary' typography='p2'>
            Custom percentage
          </Box>
          <Switch checked={isCustom} onCheckedChange={handleToggleCustomAmount} />
        </Box>
        <Input
          onChange={(e) => bridgeStore.setSlippage(e.target.value)}
          size='md'
          value={slippageInput}
          sx={{mt: 2, width: '100%'}}
        />
        <SlippageError />
      </Box>
    </Modal>
  );
});

const SlippageError: React.FC = observer(() => {
  const {slippage} = bridgeStore;

  if (!slippage || slippage?.lessThan(new Percent(0)) || slippage?.greaterThan(new Percent(1))) {
    return <Error>ENTER A VALID SLIPPAGE PERCENTAGE</Error>;
  }

  if (slippage.greaterThan(new Percent(3, 100))) {
    return <Warning>YOUR TRANSACTION MAYBE FRONTRUN</Warning>;
  }

  return null;
});

const Error = styled('div', {name: 'Error'})(({theme}) => ({
  fontSize: 12,
  lineHeight: '16px',
  color: theme.palette.error.main,
  textAlign: 'right',
  width: '100%',
  marginTop: 4,
}));

const Warning = styled(Error, {name: 'Warning'})(({theme}) => ({
  color: theme.palette.warning.main,
}));
