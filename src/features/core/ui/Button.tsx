import * as React from 'react';

import {Box, styled} from '@/core/ui/system';

enum HEIGHT {
  xs = 26,
  sm = 32,
  md = 40,
  lg = 52,
}

enum FONT_SIZE {
  xs = 12,
  sm = 12,
  md = 14,
  lg = 16,
}

type size = 'xs' | 'sm' | 'md' | 'lg';

const DEFAULT_SIZE = 'lg';

export type BaseButtonProps = {
  size?: size;
  variant?: 'primary' | 'secondary' | 'tertiary' | 'incognito';
};

export type ButtonProps = React.ComponentProps<typeof Button>;

export const Button = styled('button', {name: 'LzButton', label: 'LzButton'})<BaseButtonProps>(
  ({theme, size = DEFAULT_SIZE, variant = 'secondary'}) => ({
    borderRadius: theme.shape.borderRadius,
    border: '0',
    height: HEIGHT[size],
    fontSize: FONT_SIZE[size],
    cursor: 'pointer',
    padding: '0px 16px',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    textTransform: (theme.typography as any).button?.textTransform,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    '&:disabled': {
      opacity: 0.7,
      filter: 'grayscale(100%) invert(0.9)',
      '&:hover': {
        cursor: 'default',
      },
    },
    ...(variant === 'primary' && {
      backgroundColor: theme.palette.accent.main,
      color: theme.palette.primary.contrastText,
      '&:hover:not(:disabled)': {
        backgroundColor: theme.palette.accent.light,
      },
      '&:focus': {
        outline: 0,
        backgroundColor: theme.palette.accent.light,
      },
    }),
    ...(variant === 'secondary' && {
      backgroundColor: theme.palette.secondary.main,
      color: theme.palette.secondary.contrastText,
      '&:hover:not(:disabled)': {
        backgroundColor: theme.palette.secondary.light,
      },
      '&:focus': {
        backgroundColor: theme.palette.secondary.light,
        outline: 0,
      },
    }),
    ...(variant === 'tertiary' && {
      minHeight: 24,
      padding: '4px 9px',
      fontSize: 12,
      // not sure why that size ?
      backgroundColor: theme.palette.accent.main,
      border: `1px solid ${theme.palette.divider}`,
      borderRadius: theme.shape.borderRadius,
      color: theme.palette.text.contrast,
      '&:hover:not(:disabled)': {
        backgroundColor: theme.palette.accent.light,
      },
      '&:focus': {
        backgroundColor: theme.palette.accent.light,
        outline: 0,
      },
    }),
    ...(variant == 'incognito' && {
      background: 'transparent',
      padding: 0,
      color: theme.palette.text.primary,
      height: 'auto',
      textTransform: 'none',
      '&:hover:not(:disabled)': {
        opacity: 0.7,
      },
    }),
  }),
);

export const ButtonGroup = styled(Box, {name: 'ButtonGroup'})(({theme}) => ({
  display: 'flex',
  alignItems: 'center',
  '& > [class*=LzButton]:not(:first-of-type), & > *:first-of-type': {
    marginLeft: 1,
  },

  // Reset radii and only apply to first and last item
  '& > [class*=LzButton], & > *': {
    borderRadius: 0,
  },
  '& > [class*=LzButton]:first-of-type, & > *:first-of-type': {
    borderTopLeftRadius: theme.shape.borderRadius,
    borderBottomLeftRadius: theme.shape.borderRadius,
  },
  '& > [class*=LzButton]:last-of-type, & > *:last-of-type': {
    borderTopRightRadius: theme.shape.borderRadius,
    borderBottomRightRadius: theme.shape.borderRadius,
  },
}));
