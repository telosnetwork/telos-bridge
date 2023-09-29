import * as React from 'react';

import {styled} from '@/core/ui/system';

export interface CopyButtonProps {
  text: string;
}

const Button = styled('button', {name: 'CopyButton'})(({theme}) => ({
  border: 0,
  backgroundColor: 'transparent',
  cursor: 'pointer',
  color: theme.palette.text.secondary,
  fontSize: 12,
  padding: 0,
  '&:hover': {
    color: theme.palette.text.primary,
  },
}));

export const CopyButton = (props: CopyButtonProps) => {
  const {text} = props;
  const [hasCopied, setHasCopied] = React.useState(false);
  const handleCopy = (event: React.SyntheticEvent) => {
    event.preventDefault();
    window.navigator.clipboard.writeText(text);
    setHasCopied(true);
  };
  return (
    <Button type='button' onClick={handleCopy}>
      {hasCopied ? 'Copied!' : 'Copy'}
    </Button>
  );
};
