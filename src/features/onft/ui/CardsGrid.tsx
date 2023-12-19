import Image from 'next/legacy/image';
import React from 'react';

import {hexToHexa} from '@/core/theme';
import {styled} from '@/core/ui/system';

const Grid = styled('div', {name: 'Grid'})(({theme}) => ({
  maxWidth: '100%',
  margin: 'auto',
  display: 'flex',
  flexWrap: 'wrap',
  gap: 24,
  justifyContent: 'center',
  [theme.breakpoints.up('md')]: {
    justifyContent: 'flex-start',
  },
}));

export const CardsGrid: React.FC<React.PropsWithChildren> = ({children}) => {
  const childrenCount = React.Children.count(children);
  const placeholdersNeeded = Math.max(0, 4 - childrenCount);
  return (
    <Grid>
      {children}
      {Array.from({length: placeholdersNeeded}, (_, i) => (
        <PlaceholderCard key={`placeholder-${i}`} />
      ))}
    </Grid>
  );
};

const PlaceholderCardRoot = styled('div')(({theme}) => ({
  width: '100%',
  height: 398,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: `1px dashed ${hexToHexa(theme.palette.text.secondary, 0.4)}`,
  [theme.breakpoints.up('md')]: {
    width: 318,
  },
}));

const PlaceholderCard: React.FC = () => {
  return (
    <PlaceholderCardRoot>
      <Image src='/static/token.svg' alt='placeholder' width={40} height={40} />
    </PlaceholderCardRoot>
  );
};
