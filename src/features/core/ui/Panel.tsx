import React from 'react';

import {Box, styled, SxProps, Theme} from '@/core/ui/system';

interface CommonProps {
  theme?: Theme;
  as?: React.ElementType;
  sx?: SxProps<Theme>;
}

interface PanelProps extends CommonProps {
  children: React.ReactNode;
  endAdornment?: React.ReactNode;
  footer?: React.ReactNode;
  title?: string;
}

const PanelRoot = styled(Box, {name: 'Panel'})(({theme}) => ({
  width: '464px',
  maxWidth: '100%',
  padding: '0 16px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  color: theme.palette.text.primary,
}));

const Title = styled('div', {name: 'PanelTitle'})(({theme}) => ({
  display: 'flex',
  justifyContent: 'space-between',
  color: theme.palette.text.secondary,
  alignItems: 'center',
  marginBottom: 24,
  ...theme.typography.h1,
}));

const PanelContent = styled('div', {name: 'PanelContent'})(() => ({
  display: 'flex',
  flexDirection: 'column',
  flex: '1',
}));

const EndAdornment = styled('div', {name: 'PanelTitleEndAdornment'})(({theme}) => ({
  ...theme.typography.p3,
}));

export const Panel = (props: PanelProps) => {
  const {title, endAdornment, children, footer, sx} = props;
  return (
    <PanelRoot sx={sx}>
      {(title || endAdornment) && (
        <Title>
          <div>{title}</div>
          <EndAdornment>{endAdornment}</EndAdornment>
        </Title>
      )}
      <PanelContent>{children}</PanelContent>
      {footer}
    </PanelRoot>
  );
};
