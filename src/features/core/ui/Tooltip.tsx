import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import * as React from 'react';

import {styled, SxProps, Theme} from '@/core/ui/system';

export type WithTooltipProps = {
  children: React.ReactNode;
  text: React.ReactNode;
  sx?: SxProps<Theme>;
} & TooltipPrimitive.TooltipProps;

const Content = styled(TooltipPrimitive.Content)(({theme}) => ({
  backgroundColor: theme.palette.secondary.light,
  padding: 12,
  borderRadius: theme.shape.borderRadius,
  color: theme.palette.secondary.contrastText,
  ...theme.typography.p3,
}));

const Arrow = styled(TooltipPrimitive.Arrow)(({theme}) => ({
  fill: theme.palette.secondary.light,
}));

export const WithTooltip = (props: WithTooltipProps) => {
  const {children, text, open, defaultOpen, onOpenChange} = props;
  return (
    <TooltipPrimitive.Provider delayDuration={100}>
      <TooltipPrimitive.Root open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
        <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
        <Content side='top' align='center' {...props}>
          {text}
          <Arrow width={14} height={7} />
        </Content>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
};
