import React from 'react';

import {styled} from '@/core/ui/system';

export interface InputsGroupProps {
  children: React.ReactNode;
}

const Group = styled('div', {name: 'InputsGroup'})(({theme}) => ({
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  overflow: 'hidden',
  '& [class*=SelectButton]': {
    borderRadius: 0,
  },
  '& [class*=Input]': {
    border: 0,
    borderRadius: 0,
  },
}));

export const InputsGroup = (props: InputsGroupProps) => {
  const {children} = props;
  return <Group>{children}</Group>;
};

const Top = styled('div', {name: 'InputsGroupTop'})(() => ({
  display: 'flex',
  '& > *:not(:first-child)': {
    marginLeft: 1,
  },
}));

const InputsGroupTop = (props: InputsGroupProps) => {
  const {children} = props;
  return <Top>{children}</Top>;
};

const InputsGroupBottom = (props: InputsGroupProps) => {
  const {children} = props;
  return <div>{children}</div>;
};

InputsGroup.Top = InputsGroupTop;
InputsGroup.Bottom = InputsGroupBottom;
