import * as SwitchPrimitive from '@radix-ui/react-switch';

import {styled} from '@/core/ui/system';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface SwitchProps extends SwitchPrimitive.SwitchProps {}

const SwitchRoot = styled(SwitchPrimitive.Root)(({theme}) => ({
  width: 38,
  height: 20,
  borderRadius: 23,
  border: 0,
  padding: 0,
  cursor: 'pointer',
  backgroundColor: theme.palette.divider,
  '&[data-state=checked]': {
    backgroundColor: theme.palette.info.main,
  },
  '&:hover': {
    opacity: 0.7,
  },
}));

const Thumb = styled(SwitchPrimitive.Thumb)(() => ({
  width: 16,
  height: 16,
  borderRadius: '100%',
  backgroundColor: '#FFF',
  display: 'block',
  transform: 'translateX(2px)',
  transition: 'transform 100ms ease-in',
  '&[data-state=checked]': {
    transform: 'translateX(calc(100% + 4px))',
  },
}));

export const Switch = (props: SwitchProps) => {
  return (
    <SwitchRoot {...props}>
      <Thumb />
    </SwitchRoot>
  );
};
