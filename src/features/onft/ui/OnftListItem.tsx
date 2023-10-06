import {OnftInflightTransaction, OnftTokenAmount} from '@layerzerolabs/ui-bridge-onft';
import {getExpectedDate, tryGetNetwork} from '@layerzerolabs/ui-core';
import {observer} from 'mobx-react';

import {Icon} from '@/core/ui/Icon';
import {NetworkIcon} from '@/core/ui/NetworkIcon';
import {Box, styled} from '@/core/ui/system';
import {formatRemainingTime} from '@/core/utils/formatRemainingTime';

import {getTxRemainingTime} from '../../core/utils/txProgressUtils';
import {useAssetMetadata} from '../hooks/useAssetMetadata';
import {getInflightTx} from './OnftCard';

export interface OnftListItemProps {
  selected?: boolean;
  disabled?: boolean;
  onClick: () => void;
  asset: OnftTokenAmount;
}

type StyleProps = {
  disabled?: boolean;
  pending?: boolean;
  selected?: boolean;
};

const ListItem = styled('button', {name: 'OnftListItem-ListItem'})<StyleProps>(
  ({disabled, theme}) => ({
    background: theme.palette.secondary.main,
    textAlign: 'left',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    cursor: disabled ? 'normal' : 'pointer',
    maxWidth: '100%',
    marginBottom: 2,
    height: 64,
    backgroundColor: theme.palette.secondary.main,
    color: theme.palette.secondary.contrastText,
    border: 0,
    padding: '8px 12px 8px 8px',
    opacity: disabled ? 0.5 : 1,
    position: 'relative',
    ...theme.typography.p1,
    '&:hover': {
      backgroundColor: theme.palette.secondary.light,
    },
    [theme.breakpoints.up('md')]: {
      margin: '0 auto 2px 0',
      width: '100%',
    },
  }),
);

const ImgContainer = styled('div', {name: 'ImgContainer'})({
  height: 40,
  width: 40,
  minWidth: 40,
  overflow: 'hidden',
  marginRight: 12,
});

const SelectBox = styled('div', {name: 'SelectBox'})<StyleProps>(({pending, selected, theme}) => ({
  width: 32,
  height: 32,
  border: `1px solid ${theme.palette.divider}`,
  overflow: 'hidden',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  ...(pending && {
    display: 'none',
    [theme.breakpoints.up('md')]: {
      display: 'flex',
      border: `1px solid ${theme.palette.text.primary}`,
    },
  }),
  ...(selected && {
    border: `1px solid ${theme.palette.text.primary}`,
  }),
}));

const SelectTick = styled('div', {name: 'SelectTick'})(({theme}) => ({
  width: '100%',
  height: '100%',
  background: theme.palette.divider,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const AmountBadge = styled(Box, {name: 'AmountBadge'})(({theme}) => ({
  padding: '2px 4px',
  backgroundColor: theme.palette.secondary.light,
  color: theme.palette.text.primary,
  display: 'grid',
  placeItems: 'center',
  position: 'absolute',
  left: 0,
  top: 0,
  marginLeft: 8,
  marginTop: 12,
  fontSize: 12,
  lineHeight: 1,
  width: 40,
  [theme.breakpoints.up('md')]: {
    width: 'fit-content',
    position: 'static',
    ...theme.typography.p2,
    marginTop: 0,
    marginLeft: 0,
  },
}));

const MetaName = styled('div', {name: 'ONFTListItem-MetaName'})(({theme}) => ({
  fontWeight: 500,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  maxWidth: 115,
  [theme.breakpoints.up('md')]: {
    maxWidth: 'initial',
  },
}));

export const OnftListItem = observer((props: OnftListItemProps) => {
  const {asset, onClick, selected, disabled} = props;
  const {data: metadata} = useAssetMetadata(asset.token);
  const network = tryGetNetwork(asset?.token.contract.chainId);
  const tx = getInflightTx(asset.token);
  const pending = !!tx;
  const {amount} = asset;
  const srcNetwork = tryGetNetwork(tx?.srcChainId);
  const dstNetwork = tryGetNetwork(tx?.dstChainId);
  const handleClick = pending ? undefined : onClick;
  return (
    <ListItem onClick={handleClick} disabled={disabled} pending={pending}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          width: {xs: '160px', md: '220px'},
        }}
      >
        <ImgContainer>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={metadata?.image ?? '/static/token.svg'} alt='placeholder' />
        </ImgContainer>
        <MetaName>{metadata?.name ?? '--'}</MetaName>
      </Box>
      <Box sx={{ml: {xs: 2, md: '10%'}, width: {md: '64px'}}}>
        {amount > 1 && <AmountBadge>x{amount}</AmountBadge>}
      </Box>
      {pending ? (
        <NetworkWrapper>
          <NetworkIcon
            size={24}
            chainId={srcNetwork?.chainId}
            sx={{borderRadius: '6px', marginRight: '12px'}}
          />
          <Box sx={{mr: 2, display: {xs: 'none', md: 'block'}}}>{srcNetwork?.symbol}</Box>
          <Icon type='arrow' size={16} sx={{transform: 'rotate(-90deg)'}} />
          <NetworkIcon
            size={24}
            chainId={dstNetwork?.chainId}
            sx={{borderRadius: '6px', marginRight: '12px', ml: '16px'}}
          />
          <Box sx={{display: {xs: 'none', md: 'block'}}}>{dstNetwork?.symbol}</Box>
        </NetworkWrapper>
      ) : (
        <NetworkWrapper>
          <NetworkIcon
            size={24}
            chainId={asset?.token.contract.chainId}
            sx={{borderRadius: '6px', marginRight: '12px'}}
          />
          <Box sx={{display: {xs: 'none', md: 'block'}}}>{network?.symbol}</Box>
        </NetworkWrapper>
      )}
      <Box
        sx={{
          display: 'flex',
          minWidth: {md: '100px'},
          justifyContent: {md: 'flex-end'},
          alignItems: 'center',
        }}
      >
        {pending && <RemainingTime tx={tx} />}
        <SelectBox pending={pending} selected={selected}>
          {pending ? (
            <Icon type='spinner' size={16} />
          ) : (
            selected && (
              <SelectTick>
                <Icon type='checkmark' size={16} />
              </SelectTick>
            )
          )}
        </SelectBox>
      </Box>
    </ListItem>
  );
});

const NetworkWrapper = styled(Box, {name: 'NetworkWrapper'})(({theme}) => ({
  display: 'flex',
  alignItems: 'center',
  flex: 1,
  color: theme.palette.text.secondary,
  textTransform: 'capitalize',
  [theme.breakpoints.up('md')]: {
    marginLeft: '20%',
  },
}));

const RemainingTime: React.FC<{tx: OnftInflightTransaction}> = observer(({tx}) => {
  return (
    <RemainingTimeRoot>
      {formatRemainingTime(
        getTxRemainingTime({
          expectedDate: getExpectedDate(tx.srcChainId, tx.dstChainId, tx.blockTimestamp),
        }),
      )}
    </RemainingTimeRoot>
  );
});

const RemainingTimeRoot = styled('div', {name: 'ONFTListItem-RemainingTimeRoot'})(({theme}) => ({
  color: theme.palette.text.primary,
  textTransform: 'uppercase',
  ...theme.typography.p2,
  [theme.breakpoints.up('md')]: {
    marginRight: 12,
  },
}));

export const OnftListHeader = () => {
  return (
    <Box
      sx={{
        display: {xs: 'none', md: 'flex'},
        alignItems: 'center',
        margin: '0 auto',
        pb: 2,
        opacity: 0.4,
        typography: 'p3',
        textTransform: 'uppercase',
        justifyContent: 'space-between',
      }}
    >
      <Box sx={{width: '220px'}}>Name</Box>
      <Box sx={{ml: '10%', width: '64px'}}>Amount</Box>
      <Box sx={{display: 'flex', alignItems: 'center', flex: 1, ml: {md: '20%'}}}>Network</Box>
      <Box>Action</Box>
    </Box>
  );
};
