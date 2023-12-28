import {OnftInflightTransaction, OnftToken, OnftTokenAmount} from '@layerzerolabs/ui-bridge-onft';
import {getExpectedDate, getScanLink, tryGetNetwork} from '@layerzerolabs/ui-core';
import {observer} from 'mobx-react';
import {MouseEventHandler} from 'react';

import {hexToHexa} from '@/core/theme';
import {Icon} from '@/core/ui/Icon';
import {NetworkIcon} from '@/core/ui/NetworkIcon';
import {Box, styled} from '@/core/ui/system';
import {formatRemainingTime} from '@/core/utils/formatRemainingTime';

import {getTxRemainingTime} from '../../core/utils/txProgressUtils';
import {useAssetMetadata} from '../hooks/useAssetMetadata';
import {onftStore} from '../stores/onftStore';
import {isSameOnftContract} from '../stores/utils';

const OnftCardContainer = styled('div', {name: 'OnftCardContainer'})<{
  disabled?: boolean;
  selected?: boolean;
}>(({theme, disabled, selected}) => ({
  background: theme.palette.secondary.main,
  color: theme.palette.secondary.contrastText,
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  cursor: 'pointer',
  width: '100%',
  [theme.breakpoints.up('md')]: {
    width: 318,
  },
  ...(!disabled &&
    !selected && {
      '&:hover': {
        filter: theme.palette.mode === 'light' ? 'brightness(0.9)' : 'brightness(1.1)',
      },
    }),
  ...(disabled && {
    opacity: 0.5,
  }),
}));

const ImageContainer = styled(Box, {name: 'ImageContainer'})(() => ({
  flexShrink: 0,
  position: 'relative',
  overflow: 'hidden',
  minHeight: 318,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const DisabledOverlay = styled(Box, {name: 'DisabledOverlay'})(() => ({
  display: 'block',
  position: 'absolute',
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
  opacity: 0.8,
  zIndex: 4,
}));

const Overlay = styled(Box, {name: 'Overlay'})(({theme}) => ({
  background: theme.palette.mode === 'light' ? 'rgb(255 255 255 / 0.72)' : 'rgb(0 0 0 / 0.72)',
  position: 'absolute',
  top: 0,
  bottom: 0,
  left: 0,
  right: 0,
  zIndex: 5,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  ...theme.typography.p1,
  fontWeight: 500,
}));

const OverlayCaption = styled(Box, {name: 'OverlayCaption'})(({theme}) => ({
  ...theme.typography.p3,
  marginBottom: 4,
}));

const OverlayTitle = styled('div', {name: 'OverlayCaption'})(() => ({
  paddingTop: 28,
  fontSize: 36,
  lineHeight: '40px',
  fontWeight: 500,
  marginBottom: 64,
}));

const DetailsContainer = styled(Box, {name: 'DetailsContainer'})(() => ({
  padding: 16,
  flexGrow: 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  position: 'relative',
  zIndex: 3,
}));

const Title = styled(Box, {name: 'Title'})(({theme}) => ({
  ...theme.typography.p1,
  fontWeight: 500,
  letterSpacing: '0.04em',
  [theme.breakpoints.up('md')]: {
    letterSpacing: '-0.026em',
    fontWeight: 800,
  },
}));

const Network = styled(Box, {name: 'Network'})(({theme}) => ({
  ...theme.typography.p2,
  color: theme.palette.secondary.contrastText,
  marginTop: 2,
}));

const AmountBadge = styled(Box, {name: 'AmountBadge'})(({theme}) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  minWidth: 40,
  height: 40,
  backgroundColor: hexToHexa(theme.palette.text.secondary, 0.6),
  color: theme.palette.text.primary,
  display: 'grid',
  placeItems: 'center',
  marginTop: 16,
  marginLeft: 16,
  backdropFilter: 'blur(2px)',
}));

const Metadata = styled('div', {name: 'Metadata'})(() => ({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
}));

type ONFTCardProps = {
  asset: OnftTokenAmount;
  disabled?: boolean;
  selected?: boolean;
} & Omit<React.ComponentProps<typeof OnftCardContainer>, 'children' | 'size'>;

export function getInflightTx(asset?: OnftToken): OnftInflightTransaction | undefined {
  if (asset == null) return undefined;
  return onftStore.inflight.find((tx) =>
    tx.assets.some(
      (i) => i.token.id === asset.id && isSameOnftContract(i.token.contract, asset.contract),
    ),
  );
}

export const OnftCard: React.FC<ONFTCardProps> = observer(
  ({asset, disabled, selected, ...props}) => {
    const network = tryGetNetwork(asset?.token.contract.chainId);
    const tx = getInflightTx(asset.token);
    const {data: metadata} = useAssetMetadata(asset.token);
    const {amount} = asset;

    const onClick: MouseEventHandler | undefined = tx
      ? (e) => {
          e.stopPropagation();
          window.open(getScanLink(tx.srcChainId, tx.srcTxHash as string), '_blank');
        }
      : props.onClick;

    return (
      <OnftCardContainer {...props} disabled={disabled} selected={selected} onClick={onClick}>
        <ImageContainer>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={metadata?.image ?? '/static/token.svg'} alt='placeholder' />
          {amount > 1 && <AmountBadge>x{amount}</AmountBadge>}
          {tx ? (
            <Overlay>
              <OverlayCaption>Est time</OverlayCaption>
              <RemainingTime tx={tx} />
              <Box sx={{display: 'flex', gap: 0.5, alignItems: 'center'}}>
                {tryGetNetwork(tx.srcChainId)?.symbol}
                <Icon type='arrow' size={16} sx={{transform: 'rotate(-90deg)'}} />
                {tryGetNetwork(tx.dstChainId)?.symbol}
              </Box>
            </Overlay>
          ) : selected ? (
            <Overlay>
              <Icon type='checkmark' size={24} />
              <OverlayTitle>Selected</OverlayTitle>
            </Overlay>
          ) : null}
        </ImageContainer>
        <DetailsContainer>
          <Metadata>
            <Title>{metadata?.name ?? '--'}</Title>
            <Network>{network?.name}</Network>
          </Metadata>
          <Box sx={{alignSelf: 'flex-start'}}>
            {tx ? (
              <Box
                sx={{
                  background: 'divider',
                  border: 1,
                  borderColor: 'text.primary',
                  width: 40,
                  height: 40,
                  display: 'grid',
                  placeContent: 'center',
                }}
              >
                <Icon type='spinner' size={16} />
              </Box>
            ) : (
              <NetworkIcon size={32} chainId={asset?.token.contract.chainId} />
            )}
          </Box>
        </DetailsContainer>

        {disabled && <DisabledOverlay />}
      </OnftCardContainer>
    );
  },
);

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

const RemainingTimeRoot = styled('h1', {name: 'RemainingTimeRoot'})(() => ({
  fontSize: 36,
  lineHeight: '40px',
  marginBottom: 16,
}));
