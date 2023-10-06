import {tryGetNetwork} from '@layerzerolabs/ui-core';
import {observer} from 'mobx-react';

import {NetworkIcon} from '@/core/ui/NetworkIcon';
import {SlideInTitle} from '@/core/ui/SlideIn';
import {Box, Stack, styled} from '@/core/ui/system';

import {onftStore} from '../stores/onftStore';

const DstPickerRoot = styled(Box, {name: 'DstPickerRoot'})<{open?: boolean}>(
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
  }),
);

const DstItem = styled('button', {name: 'DstItem'})<{active?: boolean}>(({theme}) => ({
  backgroundColor: 'transparent',
  textAlign: 'left',
  width: '100%',
  marginBottom: 8,
  height: 66,
  padding: '0 12px',
  display: 'flex',
  alignItems: 'center',
  color: theme.palette.text.secondary,
  border: `1px solid ${theme.palette.divider}`,
  cursor: 'pointer',
  ...theme.typography.p3,
  '&:hover': {
    borderColor: theme.palette.text.primary,
  },
}));

const DstItemNetworkName = styled(Box, {name: 'DstItemNetworkName'})(({theme}) => ({
  ...theme.typography.p2,
  fontWeight: 500,
  color: theme.palette.text.primary,
}));

type DestinationPickerProps = {
  open?: boolean;
  onClose: () => void;
};

export const DestinationPicker = observer(({open: open, onClose}: DestinationPickerProps) => {
  return (
    <DstPickerRoot open={open}>
      <SlideInTitle sx={{mb: 3}}>Select destination chain</SlideInTitle>
      <Box>
        {onftStore.dstNetworkOptions.map((option) => {
          const chain = tryGetNetwork(option.chainId);
          const isActive = option.chainId === onftStore.dstChainId;
          return (
            <DstItem
              key={option.chainId}
              active={isActive}
              onClick={() => {
                onftStore.setDstChainId(option.chainId);
                onClose();
              }}
            >
              <NetworkIcon chainId={option.chainId} size={32} />
              <Box sx={{ml: 1, flex: 1}}>
                <Stack direction='row' justifyContent='space-between'>
                  <Box>{chain?.symbol}</Box>
                  {isActive && <Box sx={{color: 'text.primary'}}>Selected</Box>}
                </Stack>
                <DstItemNetworkName>{chain?.name}</DstItemNetworkName>
              </Box>
            </DstItem>
          );
        })}
      </Box>
    </DstPickerRoot>
  );
});
