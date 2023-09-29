import {getScanLink, getTransactionLink, tryGetNetwork} from '@layerzerolabs/ui-core';
import {Box, styled, SxProps, Theme} from '@mui/system';
import {observer} from 'mobx-react';

import {Transaction} from '@/core/stores/transactionStore';
import {Icon} from '@/core/ui/Icon';
import {formatRemainingTime} from '@/core/utils/formatRemainingTime';
import {getTxProgress, getTxRemainingTime} from '@/core/utils/txProgressUtils';

export type TrackerProps = React.PropsWithChildren<{
  onClose?: () => void;
  tx: Transaction;
  status?: React.ReactNode;
  sx?: SxProps<Theme>;
}>;

const TrackerBox = styled(Box, {name: 'TrackerBox'})(({theme}) => ({
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  width: '100%',
  minHeight: 60,
  padding: '8px 16px',
  position: 'relative',
  overflow: 'hidden',
}));

const Header = styled('div', {name: 'Header'})(() => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
}));

const MainInfo = styled('div', {name: 'MainInfo'})(() => ({
  display: 'flex',
  alignItems: 'center',
  marginTop: 4,
  justifyContent: 'space-between',
  fontSize: 14,
  lineHeight: '20px',
  textTransform: 'capitalize',
}));

type ProgressProps = {
  percentage?: number;
};

const Progress = styled('div', {name: 'Progress'})<ProgressProps>(({theme, percentage = 0}) => ({
  position: 'absolute',
  height: 2,
  backgroundColor: theme.palette.primary.main,
  transition: 'all 1s linear',
  width: `${percentage}%`,
  bottom: 0,
  left: 0,
}));

const CloseBtn = styled('button')(({theme}) => ({
  border: 0,
  backgroundColor: 'transparent',
  padding: 0,
  display: 'flex',
  color: theme.palette.text.secondary,
  fontSize: 12,
  lineHeight: '16px',
  '&:hover': {
    opacity: 0.7,
    cursor: 'pointer',
  },
}));

export const Tracker = observer((props: TrackerProps) => {
  const {sx, tx, onClose} = props;
  const {srcChainId, dstChainId, txHash} = tx;

  const srcChain = tryGetNetwork(srcChainId);
  const dstChain = tryGetNetwork(dstChainId);
  const progress = getTxProgress(tx);
  const remaining = getTxRemainingTime(tx);
  const percentage = progress * 100;

  const link = txHash
    ? srcChainId && dstChainId
      ? getScanLink(srcChainId, txHash)
      : getTransactionLink(srcChainId, txHash)
    : undefined;

  return (
    <TrackerBox sx={sx}>
      <Header>
        <Box
          component={'a'}
          href={link}
          target='_blank'
          rel='noreferrer'
          sx={{
            display: 'flex',
            alignItems: 'center',
            fontSize: 12,
            lineHeight: '16px',
            color: 'text.secondary',
          }}
        >
          {srcChain?.name}&nbsp;
          <Icon type='arrow' size={12} sx={{transform: 'rotate(-90deg)'}} />
          &nbsp;{dstChain?.name}
        </Box>

        {onClose && (
          <CloseBtn type='button' onClick={onClose}>
            Close
          </CloseBtn>
        )}
      </Header>
      <MainInfo>
        {props.children}
        {props.status ?? (
          <Box color={tx.completed ? 'success.main' : tx.error ? 'warning.main' : 'primary.main'}>
            {tx.completed ? 'Complete' : tx.error ? 'Failed' : formatRemainingTime(remaining)}
          </Box>
        )}
      </MainInfo>
      <Progress percentage={percentage} />
    </TrackerBox>
  );
});
