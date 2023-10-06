import Image from 'next/legacy/image';

import {Box, styled} from '@/core/ui/system';

import {CardsGrid} from './CardsGrid';

export const NoAssetsPlaceholder: React.FC = () => {
  return (
    <>
      <CardsGrid>
        <EmptyCard />
        <EmptyCard />
        <EmptyCard />
        <EmptyCard />
      </CardsGrid>
    </>
  );
};

const EmptyCardRoot = styled('div')(({theme}) => ({
  width: 318,
  height: 398,
  backgroundColor: theme.palette.background.paper,
}));

const Img = styled('div')(({theme}) => ({
  width: 318,
  height: 318,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  filter: 'brightness(1.3)',
  backgroundColor: theme.palette.background.paper,
}));

const EmptyCard = () => {
  return (
    <EmptyCardRoot>
      <Img>
        <Image src='/static/token.svg' alt='placeholder' width={40} height={40} />
      </Img>
      <Box sx={{display: 'flex', alignItems: 'center', pt: '22px', pb: '20px', px: 2}}>
        <Box>
          <Box sx={{width: 111, height: 12, backgroundColor: 'divider'}} />
          <Box sx={{width: 68, height: 12, backgroundColor: 'divider', mt: 1.5}} />
        </Box>
        <Box sx={{width: 40, height: 40, backgroundColor: 'divider', ml: 'auto'}} />
      </Box>
    </EmptyCardRoot>
  );
};
