import * as Dialog from '@radix-ui/react-dialog';

import {Button} from '@/core/ui/Button';
import {Icon} from '@/core/ui/Icon';
import {styled, TypographyProps} from '@/core/ui/system';
import * as animation from '@/core/utils/animations';

export interface SlideInProps {
  children: React.ReactNode;
  height?: number;
  onClose: () => void;
  open: boolean;
  topAdornment?: React.ReactNode;
}

const DialogOverlay = styled(Dialog.Overlay)({
  background: 'rgba(0 0 0 / 0.72)',
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  display: 'grid',
  placeItems: 'center',
  overflowY: 'auto',
});

const DialogContent = styled(Dialog.Content)<{height?: number}>(({theme}) => ({
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
  flexDirection: 'column',
  fontFamily: (theme.typography as TypographyProps).fontFamily,
  width: '100%',
  height: '100%',
  overflow: 'hidden',
  "&[data-state='open']": {
    animation: animation.slideInUp,
  },
  "&[data-state='closed']": {
    animation: animation.slideOutDown,
  },
  [theme.breakpoints.up('md')]: {
    width: 432,
    top: 0,
    bottom: 0,
    right: 0,
    left: 'auto',
    transform: 'none',
    "&[data-state='open']": {
      animation: animation.slideInLeft,
    },
    "&[data-state='closed']": {
      animation: animation.slideOutRight,
    },
  },
}));

const DialogClose = styled(Dialog.Close)({
  backgroundColor: 'transparent',
  border: 0,
  position: 'absolute',
  top: 23,
  right: 19,
  cursor: 'pointer',
  paddingRight: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 0,
  '& img': {
    width: 24,
  },
  '&:hover': {
    opacity: 0.7,
  },
});

const ScrollContainer = styled('div', {name: 'SlideInScrollContainer'})(({theme}) => ({
  overflowY: 'scroll',
  flex: 1,
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

const TopAdornment = styled('div', {name: 'SlideInTopAdornment'})({
  marginBottom: '12px',
  marginLeft: '16px',
});

export const SlideIn = (props: SlideInProps) => {
  const {open, onClose, children, topAdornment, height} = props;
  return (
    <Dialog.Root open={open} onOpenChange={(isOpen) => !isOpen && onClose?.()}>
      <Dialog.Portal>
        <DialogOverlay />
        <DialogContent height={height}>
          {topAdornment && <TopAdornment>{topAdornment}</TopAdornment>}
          <ScrollContainer>{children}</ScrollContainer>
          <DialogClose asChild>
            <Button variant='incognito' type='button'>
              <Icon type='close' size={16} />
            </Button>
          </DialogClose>
        </DialogContent>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export const SlideInTitle = styled('div')(({theme}) => ({
  ...theme.typography.p1,
  marginTop: 8,
  color: theme.palette.text.primary,
}));

export const SlideInContent = styled('div', {name: 'SlideInContent'})(() => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: 16,
  overflow: 'hidden',
  height: '100%',
}));
