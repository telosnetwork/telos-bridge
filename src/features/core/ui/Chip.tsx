import * as React from 'react';

import {styled} from '@/core/ui/system';

export interface ChipProps {
  children?: React.ReactNode;
  icon?: React.ReactNode;
  rounded?: boolean;
}

const SChip = styled('div', {
  name: 'Chip',
  shouldForwardProp: (prop) => prop !== 'rounded',
})<ChipProps>(({theme, ...props}) => ({
  backgroundColor: theme.palette.secondary.main,
  padding: '4px 12px 4px 4px',
  fontSize: 12,
  fontWeight: 500,
  lineHeight: '16px',
  minHeight: 32,
  display: 'flex',
  alignItems: 'center',
  borderRadius: props.rounded ? theme.shape.borderRadius : 0,
  color: theme.palette.secondary.contrastText,
}));

const Icon = styled('div', {name: 'ChipIcon', shouldForwardProp: () => false})<ChipProps>(
  ({rounded}) => ({
    width: 24,
    height: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginRight: 8,
    borderRadius: rounded ? '100%' : 0,
  }),
);

export const Chip = (props: ChipProps) => {
  const {children, icon, rounded} = props;
  return (
    <SChip rounded={rounded}>
      <Icon rounded={rounded}>{icon}</Icon>
      {children}
    </SChip>
  );
};
