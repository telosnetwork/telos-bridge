import * as Dialog from '@radix-ui/react-dialog';

import {Box, keyframes, styled, TypographyProps} from '@/core/ui/system';

import {Icon} from './Icon';

export enum AlertType {
  LOADING = 'loading',
  SUCCESS = 'success',
  ERROR = 'error',
}

interface AlertProps {
  children: React.ReactNode;
  image?: React.ReactNode;
  onClose?: () => void;
  open?: boolean;
  overlay?: boolean;
  title: string;
  type?: AlertType;
}

const DialogContent = styled(Dialog.Content, {
  shouldForwardProp: (prop) => prop !== 'shown',
  name: 'Alert',
})(({theme}) => ({
  position: 'fixed',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  maxWidth: '100%',
  width: '100%',
  minHeight: '100%',
  backgroundColor: theme.palette.background.paper,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  color: theme.palette.text.secondary,
  padding: '24px 64px',
  textAlign: 'center',
  borderRadius: theme.shape.borderRadius,
  fontFamily: (theme.typography as TypographyProps).fontFamily,
  zIndex: 1001,
  [theme.breakpoints.up('md')]: {
    width: 600,
    minHeight: 420,
  },
}));

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
  zIndex: 1000,
}));

const rotate = keyframes({
  '0%': {
    transform: 'rotate(0deg)',
  },
  '100%': {
    transform: 'rotate(360deg)',
  },
});

const LoadingIcon = styled('div', {name: 'AlertLoadingIcon'})(({theme}) => ({
  borderRadius: '100%',
  width: '96px',
  height: '96px',
  borderWidth: '1px',
  borderStyle: 'solid',
  borderColor: theme.palette.text.primary,
  borderTopColor: theme.palette.divider,
  animation: `${rotate} 1s ease-out infinite`,
}));

const SuccessIcon = styled('div', {name: 'AlertSuccessIcon'})(({theme}) => ({
  borderRadius: '100%',
  width: '96px',
  height: '96px',
  borderWidth: '1px',
  borderStyle: 'solid',
  borderColor: theme.palette.success.main,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const ErrorIcon = styled('div', {name: 'AlertErrorIcon'})(({theme}) => ({
  borderRadius: '100%',
  width: '96px',
  height: '96px',
  borderWidth: '1px',
  borderStyle: 'solid',
  borderColor: theme.palette.error.main,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const DialogTitle = styled(Dialog.Title, {name: 'AlertTitle'})(({theme}) => ({
  ...theme.typography.h1,
  marginBottom: '16px',
  color: theme.palette.text.primary,
  textAlign: 'center',
}));

const DialogClose = styled(Dialog.Close)(() => ({
  backgroundColor: 'transparent',
  border: 0,
  position: 'absolute',
  top: 23,
  right: 19,
  cursor: 'pointer',
  paddingRight: 0,
  '&:hover': {
    filter: 'brightness(1.5)',
  },
}));

export const Alert = (props: AlertProps) => {
  const {children, type, title, onClose, image, overlay = true, ...alertProps} = props;
  return (
    <Dialog.Root open={alertProps.open} onOpenChange={(isOpen) => !isOpen && onClose?.()}>
      <Dialog.Portal>
        {overlay && <DialogOverlay />}
        <DialogContent {...alertProps}>
          {onClose && (
            <DialogClose asChild>
              <Icon type='close' size={16} />
            </DialogClose>
          )}
          <Box sx={{height: '184px', display: 'flex', alignItems: 'center'}}>
            {image}
            {type === AlertType.LOADING && <LoadingIcon />}
            {type === AlertType.SUCCESS && (
              <SuccessIcon>
                <Icon type='checkmark' size={16} sx={{color: (t) => t.palette.success.main}} />
              </SuccessIcon>
            )}
            {type === AlertType.ERROR && (
              <ErrorIcon>
                <Icon type='close' size={16} sx={{color: (t) => t.palette.error.main}} />
              </ErrorIcon>
            )}
          </Box>
          <DialogTitle>{title}</DialogTitle>
          {children}
        </DialogContent>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
