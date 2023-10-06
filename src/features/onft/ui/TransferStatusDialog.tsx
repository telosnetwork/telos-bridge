import {tryGetNetwork} from '@layerzerolabs/ui-core';
import {observer} from 'mobx-react';

import {Icon} from '@/core/ui/Icon';
import {Box, styled} from '@/core/ui/system';

import {useAssetMetadata} from '../hooks/useAssetMetadata';
import {onftStore} from '../stores/onftStore';

type TransferStatusDialogProps = {
  open?: boolean;
};

const DialogRoot = styled(Box, {name: 'DstPickerRoot'})<{open?: boolean}>(({open, theme}) => ({
  position: 'absolute',
  bottom: open ? 0 : -100,
  right: 0,
  left: 0,
  height: open ? 320 : 0,
  backgroundColor: theme.palette.background.paper,
  zIndex: 10,
  transition: 'height 200ms ease-out',
  padding: 16,
  color: theme.palette.text.secondary,
  borderTop: `1px solid ${theme.palette.divider}`,
  display: 'flex',
  flexDirection: 'column',
  ...theme.typography.p3,
}));

const TitleLine = styled('div', {name: 'TitleLine'})(() => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: 8,
}));

const Title = styled('div', {name: 'Title'})(({theme}) => ({
  ...theme.typography.h3,
  color: theme.palette.text.primary,
}));

const Accent = styled('span', {name: 'Accent'})(({theme}) => ({
  color: theme.palette.text.primary,
}));

export const TransferStatusDialog = observer((props: TransferStatusDialogProps) => {
  const {open} = props;
  const {srcChainId, dstChainId, isMining, form} = onftStore;
  const srcChain = tryGetNetwork(srcChainId);
  const dstChain = tryGetNetwork(dstChainId);

  const {data: metadata} = useAssetMetadata(form.items.at(0)?.token);

  const assets = form.items.length;

  return (
    <DialogRoot open={open}>
      <TitleLine>
        <Title>{isMining ? 'Submitting transaction...' : 'Confirm in your wallet...'}</Title>
        <Icon type='spinner' size={16} />
      </TitleLine>
      <div>
        Transferring {assets} {metadata?.name ?? 'assets'} from <Accent>{srcChain?.name}</Accent> to{' '}
        <Accent>{dstChain?.name}</Accent>
      </div>
      <Box sx={{mt: 'auto'}}>
        {isMining
          ? 'Waiting for blockchain confirmation'
          : 'Please check pending wallet actions if you did not receive a transaction prompt'}
      </Box>
    </DialogRoot>
  );
});
