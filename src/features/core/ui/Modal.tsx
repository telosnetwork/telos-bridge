import * as Dialog from '@radix-ui/react-dialog';
import React from 'react';

import {styled, TypographyProps} from '@/core/ui/system';
import * as animation from '@/core/utils/animations';

import {Icon} from './Icon';

export type ModalProps = {
  children: React.ReactNode;
  onClose: () => void;
  open: boolean;
  title: React.ReactNode;
  overlay?: boolean;
  topAdornment?: React.ReactNode;
  onOpenAutoFocus?: Dialog.FocusScopeProps['onMountAutoFocus'];
};

const DialogOverlay = styled(Dialog.Overlay)(() => ({
  background: 'rgba(0 0 0 / 0.72)',
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  display: 'grid',
  placeItems: 'center',
  overflowY: 'auto',
  "&[data-state='open']": {
    animation: animation.fadeIn,
  },
  "&[data-state='closed']": {
    animation: animation.fadeOut,
    opacity: 0,
  },
}));

const DialogContent = styled(Dialog.Content, {name: 'Modal-DialogContent'})(({theme}) => ({
  pointerEvents: 'none',
  backgroundColor: theme.palette.background.paper,
  maxWidth: '100%',
  position: 'fixed',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  zIndex: 10,
  paddingTop: 16,
  display: 'flex',
  overflow: 'hidden',
  flexDirection: 'column',
  fontFamily: (theme.typography as TypographyProps).fontFamily,
  borderRadius: theme.shape.borderRadius,
  width: '100%',
  height: '100%',
  "&[data-state='open']": {
    animation: animation.modalContentIn,
  },
  "&[data-state='closed']": {
    animation: animation.modalContentOut,
    opacity: 0,
  },

  [theme.breakpoints.up('md')]: {
    width: 432,
    height: 584,
  },
}));

const DialogTitle = styled(Dialog.Title)(({theme}) => ({
  display: 'flex',
  justifyContent: 'space-between',
  marginBottom: 20,
  marginRight: 16,
  marginLeft: 16,
  color: theme.palette.text.primary,
  ...theme.typography.p1,
}));

const DialogClose = styled(Dialog.Close)(({theme}) => ({
  backgroundColor: 'transparent',
  border: 0,
  position: 'absolute',
  top: 23,
  right: 19,
  cursor: 'pointer',
  color: theme.palette.text.primary,
  paddingRight: 0,
  '&:hover': {
    filter: 'brightness(1.5)',
  },
}));

const ScrollContainer = styled('div', {name: 'ScrollContainer'})(({theme}) => ({
  overflowY: 'scroll',
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  '&::-webkit-scrollbar': {
    width: '1px',
  },
  '&::-webkit-scrollbar-track': {
    background: 'transparent',
  },
  '&::-webkit-scrollbar-thumb': {
    background: theme.palette.text.secondary,
  },
  '&::-webkit-scrollbar-thumb:hover': {
    background: theme.palette.text.secondary,
  },
}));

const TopAdornment = styled('div', {name: 'ModalTopAdornment'})(() => ({
  marginBottom: '32px',
}));

export const Modal = (props: ModalProps) => {
  const {
    title,
    open,
    onClose,
    children,
    topAdornment,
    overlay = true,
    onOpenAutoFocus = () => {},
  } = props;
  return (
    <Dialog.Root open={open} onOpenChange={(isOpen) => !isOpen && onClose?.()}>
      <Dialog.Portal>
        {overlay && <DialogOverlay />}
        <DialogContent onOpenAutoFocus={onOpenAutoFocus}>
          <DialogTitle>{title}</DialogTitle>
          {topAdornment && <TopAdornment>{topAdornment}</TopAdornment>}
          <ScrollContainer>{children}</ScrollContainer>
          <DialogClose asChild>
            <Icon type='close' size={16} />
          </DialogClose>
        </DialogContent>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
