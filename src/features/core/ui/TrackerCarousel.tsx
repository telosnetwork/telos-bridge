import {Box, styled, SxProps, Theme} from '@mui/system';
import * as React from 'react';

import {useHasMounted} from '@/core/hooks/useHasMounted';
import {usePagination} from '@/core/hooks/usePagination';
import {Transaction} from '@/core/stores/transactionStore';
import {Button} from '@/core/ui/Button';
import {Icon} from '@/core/ui/Icon';

import {Tracker} from './Tracker';

export interface TrackerCarouselProps {
  title?: string;
  txs: Transaction[];
  // todo: force key on result
  renderTracker?: (tx: Transaction) => React.ReactNode;
  onTxClose?: (tx: Transaction) => (() => void) | undefined;
  sx?: SxProps<Theme>;
}

const TrackerRoot = styled('div', {name: 'TrackerRoot'})(({theme}) => ({
  fontSize: 12,
  lineHeight: '16px',
  color: theme.palette.text.secondary,
  width: '100%',
}));

const Row = styled('div')(() => ({
  display: 'flex',
  overflowX: 'hidden',
}));

const Header = styled('div')(() => ({
  marginBottom: 8,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'baseline',
}));

export const TrackerCarousel = (props: TrackerCarouselProps) => {
  const isMounted = useHasMounted();
  const {txs, sx, onTxClose, title = 'Transactions'} = props;
  const pagination = usePagination(txs, 1);

  if (!isMounted || !txs || txs.length === 0) {
    return null;
  }

  return (
    <TrackerRoot sx={sx}>
      <Header>
        {title}
        <Box sx={{display: 'flex'}}>
          {pagination.totalPagesCount > 1 && (
            <>
              <Button variant='incognito' onClick={pagination.onPrevPage} sx={{mr: 1}}>
                <Icon type='chevron' size={12} sx={{transform: 'rotate(90deg)'}} />
              </Button>
              {pagination.currentPage}/{pagination.totalPagesCount}
              <Button variant='incognito' onClick={pagination.onNextPage} sx={{ml: 1}}>
                <Icon type='chevron' size={12} sx={{transform: 'rotate(-90deg)'}} />
              </Button>
            </>
          )}
        </Box>
      </Header>
      <Row>
        {pagination.currentPageItems.map((tx) =>
          props.renderTracker ? (
            props.renderTracker(tx)
          ) : (
            <Tracker
              tx={tx}
              key={tx.txHash}
              sx={{minWidth: '100%'}}
              onClose={onTxClose ? onTxClose(tx) : undefined}
            />
          ),
        )}
      </Row>
    </TrackerRoot>
  );
};
