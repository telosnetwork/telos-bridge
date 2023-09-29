import React from 'react';

import {styled} from '@/core/ui/system';

import {Button} from './Button';
import {Icon} from './Icon';

type SelectButtonProps = {
  chevron?: boolean;
  connected?: boolean;
  icon?: React.ReactNode;
  onClick?: () => void;
  readonly?: boolean;
  title: string;
  value?: string;
} & SelectButtonRootProps;

type SelectButtonRootProps = React.ComponentProps<typeof SelectButtonRoot>;

const SelectButtonRoot = styled(Button, {
  name: 'SelectButtonRoot',
  label: 'SelectButtonRoot',
  shouldForwardProp: (prop) => prop !== 'readonly',
})<{
  readonly?: boolean;
}>((props) => ({
  cursor: props.onClick ? 'pointer' : 'initial',
  height: '72px',
  minWidth: '136px',
  display: 'flex',
  position: 'relative',
  width: '100%',
  padding: '16px',
  textAlign: 'left',
  fontFamily: props.theme.typography.fontFamily,
  ...(props.readonly && {
    '&:hover:not(:disabled)': {
      backgroundColor: props.theme.palette.secondary.main,
    },
    '&:focus': {
      backgroundColor: props.theme.palette.secondary.main,
    },
  }),
}));

const Title = styled('div', {name: 'SelectButtonTitle'})(({theme}) => ({
  ...theme.typography.p3,
  color: theme.palette.secondary.contrastText,
}));

type ValueProps = {withIcon?: boolean; readonly?: boolean};

const Value = styled('div', {
  name: 'SelectButtonValue',
  shouldForwardProp: (prop) => prop !== 'withIcon' && prop !== 'readonly',
})<ValueProps>(({theme, ...props}) => ({
  color: props.readonly ? theme.palette.text.secondary : theme.palette.secondary.contrastText,
  alignItems: 'center',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  display: 'inline-block',
  fontWeight: '500',
  maxWidth: props.withIcon ? '60%' : '95%',

  '& > svg': {
    marginLeft: '8px',
  },
}));

const ValueLine = styled('div')(() => ({
  display: 'flex',
  alignItems: 'center',
  '& > svg': {
    marginLeft: '8px',
    minWidth: '10px',
  },
}));

const SelectButtonIcon = styled('div', {name: 'SelectButtonIcon'})(({theme}) => ({
  marginRight: '16px',
  minWidth: 40,
  borderRadius: theme.shape.borderRadius,
  overflow: 'hidden',
}));

const ContentWrapper = styled('div')(() => ({
  width: '100%',
}));

const ConnectedIcon = styled('div')(() => ({
  position: 'absolute',
  top: 0,
  right: 0,
  marginTop: 8,
  marginRight: 8,
}));

export const SelectButton: React.FC<SelectButtonProps> = ({
  chevron = true,
  connected,
  readonly = false,
  icon,
  title,
  value,
  ...btnProps
}) => {
  return (
    <SelectButtonRoot {...btnProps} readonly={readonly}>
      {icon && <SelectButtonIcon>{icon}</SelectButtonIcon>}
      <ContentWrapper>
        <Title>{title}</Title>
        <ValueLine>
          <Value withIcon={!!icon} readonly={readonly}>
            {value || 'Select'}
          </Value>
          {chevron && <Icon type='chevron' size={10} />}
        </ValueLine>
      </ContentWrapper>
      {connected && (
        <ConnectedIcon>
          <Icon type='activeDot' sx={{color: (t) => t.palette.success.main}} size={12} />
        </ConnectedIcon>
      )}
    </SelectButtonRoot>
  );
};
