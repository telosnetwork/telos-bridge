import React from 'react';

import {styled, SxProps, Theme} from '@/core/ui/system';

interface CommonProps {
  theme?: Theme;
  as?: React.ElementType;
  sx?: SxProps<Theme>;
}

export interface ListItemProps extends CommonProps {
  disabled?: boolean;
  onClick?: () => void;
  topLeft?: string;
  topRight?: string;
  topCenter?: string;
  bottomCenter?: string;
  bottomLeft?: string;
  bottomRight?: string;
  startAdornment?: React.ReactNode;
  endAdornment?: React.ReactNode;
  overlay?: React.ReactNode;
}

const Item = styled('button', {name: 'ListItem'})<{disabled?: boolean; overlay?: React.ReactNode}>(
  ({theme, disabled, overlay}) => ({
    display: 'flex',
    justifyContent: 'space-between',
    position: 'relative',
    alignItems: 'stretch',
    backgroundColor: 'transparent',
    border: '0',
    color: theme.palette.text.primary,
    width: '100%',
    padding: '10px 16px',
    ...theme.typography.p2,
    '&:hover': {
      backgroundColor: theme.palette.background.default,
    },
    '&:focus': {
      backgroundColor: theme.palette.background.default,
      outline: 0,
    },
    ...(disabled ? {opacity: 0.5, cursor: 'initial'} : {cursor: 'pointer'}),
    '&:not(:hover) > [class*=ListItemOverlay]': {
      display: 'none',
    },
    ...(overlay && {
      '&:hover > [class*=ListItemRight]': {
        display: 'none',
      },
    }),
  }),
);

const Left = styled('div', {name: 'ListItemLeft'})(() => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  flex: 1,
  justifyContent: 'space-between',
}));

const Right = styled('div', {name: 'ListItemRight', label: 'ListItemRight'})(() => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-end',
  justifyContent: 'space-between',
}));

const Center = styled('div', {name: 'ListItemCenter'})(() => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  flex: 1,
  justifyContent: 'space-between',
}));

const Label = styled('div', {name: 'ListItemLabel'})(({theme}) => ({
  color: theme.palette.text.secondary,
  whiteSpace: 'nowrap',
  ...theme.typography.p3,
}));

const Value = styled('div', {name: 'ListItemValue'})(() => ({
  fontWeight: '400',
  letterSpacing: '-0.02em',
  lineHeight: '20px',
}));

const Start = styled('div', {name: 'ListItemStart'})({
  width: 32,
  height: 32,
  marginRight: 12,
  alignSelf: 'center',
  flexShrink: 0,
});

const End = styled('div', {name: 'ListItemEnd'})({
  marginLeft: 12,
  alignSelf: 'center',
});

const Overlay = styled('div', {name: 'ListItemOverlay', label: 'ListItemOverlay'})(({theme}) => ({
  display: 'flex',
  justifyContent: 'flex-end',
  alignItems: 'center',
  textAlign: 'end',
  marginLeft: 12,
  ...theme.typography.p3,
}));

export const ListItem = (props: ListItemProps) => {
  const {
    bottomCenter,
    bottomLeft,
    bottomRight,
    endAdornment,
    onClick,
    startAdornment,
    topCenter,
    topLeft,
    topRight,
    overlay,
    ...commonProps
  } = props;
  return (
    <Item onClick={onClick} overlay={overlay} {...commonProps}>
      {startAdornment && <Start>{startAdornment}</Start>}
      <Left>
        <Label>{topLeft}</Label>
        <Value>{bottomLeft}</Value>
      </Left>
      <Center>
        <Label>{topCenter}</Label>
        <Value>{bottomCenter}</Value>
      </Center>
      <Right>
        <Label>{topRight}</Label>
        <Value>{bottomRight}</Value>
      </Right>
      {endAdornment && <End>{endAdornment}</End>}
      {overlay && <Overlay>{overlay}</Overlay>}
    </Item>
  );
};
