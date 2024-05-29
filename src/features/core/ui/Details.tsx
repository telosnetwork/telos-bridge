import React from 'react';

import {Box, styled, SxProps, Theme} from '@/core/ui/system';

interface DetailsItem {
  label: React.ReactNode;
  key?: string;
  value: React.ReactNode;
}

export type DetailsProps = {
  items: DetailsItem[];
  sx?: SxProps<Theme>;
};

const Item = styled('div', {name: 'DetailsItem'})(({theme}) => ({
  display: 'flex',
  justifyContent: 'space-between',
  '&:not(:last-of-type)': {
    marginBottom: theme.spacing(1),
  },
}));

const Key = styled('div', {name: 'Details-ItemKey'})(({theme}) => ({
  ...theme.typography.p2,
  color: theme.palette.text.secondary,
}));

const Value = styled('div', {name: 'Details-ItemValue'})(({theme}) => ({
  ...theme.typography.p2,
  color: theme.palette.text.primary,
}));

export const Details = (props: DetailsProps) => {
  const {items, sx} = props;
  return (
    <Box sx={sx}>
      {items.map(({key, label, value}, index) => (
        <Item key={key ?? index}>
          <Key>{label ?? key}</Key>
          <Value>{value}</Value>
        </Item>
      ))}
    </Box>
  );
};
