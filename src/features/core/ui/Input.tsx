import React, {forwardRef} from 'react';

import {styled} from '@/core/ui/system';

type SizeType = 'md' | 'lg';

enum HEIGHT {
  md = 40,
  lg = 68,
}
enum FONT_SIZE {
  md = 14,
  lg = 24,
}
enum ADORNMENT_PADDING {
  md = 8,
  lg = 16,
}

type InputBaseProps = {
  endAdornment?: React.ReactNode;
  error?: string;
  placeholder?: string;
  size?: SizeType;
  startAdornment?: React.ReactNode;
};

type InputProps = Omit<React.ComponentPropsWithRef<typeof InputBase>, 'size'> & InputBaseProps;

const InputWrapper = styled('div', {
  name: 'InputWrapper',
  label: 'InputWrapper',
  shouldForwardProp: (props) => props !== 'size' && props !== 'sx',
})<{size?: SizeType}>(({theme, ...props}) => ({
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  height: HEIGHT[props.size ?? 'md'],
  paddingLeft: ADORNMENT_PADDING[props.size ?? 'md'],
  paddingRight: ADORNMENT_PADDING[props.size ?? 'md'],
  width: '100%',
  '&:hover': {
    // filter: 'brightness(1.1)',
  },
  '&:focus-within': {
    // filter: 'brightness(1.2)',
  },
}));

const InputBase = styled('input', {
  shouldForwardProp: (props) =>
    props !== 'size' && props !== 'startAdornment' && props !== 'endAdornment',
  name: 'Input',
})<InputBaseProps>((props) => ({
  backgroundColor: 'transparent',
  color: props.theme.palette.text.primary,
  fontSize: FONT_SIZE[props.size ?? 'md'],
  border: 0,
  width: 0,
  flexBasis: 0,
  flexGrow: 1,
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis',

  '&:focus': {
    outline: 0,
  },
  '&::-webkit-input-placeholder': {
    color: props.theme.palette.text.primary,
    opacity: 0.24,
  },
}));

const StartAdornment = styled('div', {name: 'InputStartAdornment'})<{size?: SizeType}>(
  ({size = 'md'}) => ({
    marginRight: ADORNMENT_PADDING[size],
  }),
);

const EndAdornment = styled('div', {name: 'InputEndAdornment'})<{size?: SizeType}>(
  ({size = 'md'}) => ({
    marginLeft: ADORNMENT_PADDING[size],
    display: 'flex',
  }),
);

const Error = styled('div', {name: 'InputError'})(({theme}) => ({
  color: theme.palette.error.main,
  textAlign: 'right',
  width: '100%',
  marginTop: 4,
  ...theme.typography.p3,
}));

export const Input: React.FC<InputProps> = forwardRef((props: InputProps, ref) => {
  const {endAdornment, startAdornment, size, sx, error, ...inputProps} = props;
  return (
    <>
      <InputWrapper sx={sx} size={size}>
        {startAdornment && <StartAdornment size={size}>{startAdornment}</StartAdornment>}
        <InputBase
          type='text'
          ref={ref}
          startAdornment={startAdornment}
          endAdornment={endAdornment}
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          size={size}
          {...inputProps}
        />
        {endAdornment && <EndAdornment size={size}>{endAdornment}</EndAdornment>}
      </InputWrapper>
      {error && <Error>{error}</Error>}
    </>
  );
});

Input.displayName = 'Input';

// Generic helper to use from outside
interface InputAdornmentProps {
  children: React.ReactNode;
}

const SInputAdornment = styled('div', {name: 'InputAdornment'})(() => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-end',
}));

export const InputAdornment = (props: InputAdornmentProps) => {
  return <SInputAdornment>{props.children}</SInputAdornment>;
};
