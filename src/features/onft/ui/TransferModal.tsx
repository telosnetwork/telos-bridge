import {OnftStandard} from '@layerzerolabs/ui-bridge-onft';
import {tryGetNetwork} from '@layerzerolabs/ui-core';
import {observer} from 'mobx-react';
import {useCallback} from 'react';

import {fiatStore} from '@/core/stores/fiatStore';
import {Button} from '@/core/ui/Button';
import {Details} from '@/core/ui/Details';
import {Icon} from '@/core/ui/Icon';
import {NetworkIcon} from '@/core/ui/NetworkIcon';
import {SlideIn, SlideInContent, SlideInProps, SlideInTitle} from '@/core/ui/SlideIn';
import {Box, styled} from '@/core/ui/system';

import {useAssetMetadata} from '../hooks/useAssetMetadata';
import {useToggle} from '../hooks/useToggle';
import {FormItem, onftStore} from '../stores/onftStore';
import {assetKey} from '../stores/utils';
import {DestinationPicker} from './DestinationPicker';
import {GasOnDestinationDetailItem} from './GasOnDestinationDetailItem';
import {GasOnDestinationPicker} from './GasOnDestinationPicker';
import {TransferStatusDialog} from './TransferStatusDialog';

export type TransferModalProps = Omit<SlideInProps, 'children' | 'title'>;

const Networks = styled('div', {name: 'Networks'})(({theme}) => ({
  color: theme.palette.text.secondary,
  marginBottom: 36,
  width: '100%',
  position: 'relative',
  marginTop: 'auto',
  letterSpacing: '-0.02em',
  ...theme.typography.p3,
}));

const NetworkItem = styled('div', {name: 'NetworkItem'})(() => ({
  display: 'flex',
  alignItems: 'center',
}));

const NetworkName = styled('div', {name: 'NetworkName'})(({theme}) => ({
  ...theme.typography.p2,
  fontWeight: 500,
  color: theme.palette.text.primary,
}));

const NetworkArrow = styled('div', {name: 'NetworkArrow'})(({theme}) => ({
  width: 40,
  height: 40,
  borderRadius: '100%',
  border: `1px solid ${theme.palette.divider}`,
  margin: 'auto',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
  '&::before': {
    position: 'absolute',
    content: '""',
    width: 392,
    height: 1,
    backgroundColor: theme.palette.divider,
    left: 0,
    zIndex: -1,
  },
}));

const ListContainer = styled('div', {name: 'TransferModal-ListContainer'})(({theme}) => ({
  width: '100%',
  marginBottom: 30,
  position: 'relative',
  overflow: 'hidden',
  '&::after': {
    position: 'absolute',
    content: '""',
    background: `linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, ${theme.palette.background.paper} 100%)`,
    bottom: 0,
    left: 0,
    right: 0,
    height: 55,
    pointerEvents: 'none',
  },
  [theme.breakpoints.up('md')]: {
    marginBottom: 80,
  },
}));

const List = styled('div', {name: 'List'})(() => ({
  width: '100%',
  height: '100%',
  overflowY: 'auto',
  paddingBottom: 40,
  display: 'flex',
  flexDirection: 'column',
  rowGap: 16,
}));

export const TransferModal = observer((props: TransferModalProps) => {
  const {
    srcChainId,
    form,
    dstChainId,
    errors,
    isApproving,
    isExecuting,
    isMining,
    isSigning,
    messageFee,
  } = onftStore;
  const {items: selection} = form;
  const [error] = errors;
  const srcChain = tryGetNetwork(srcChainId);
  const dstChain = tryGetNetwork(dstChainId);
  const inProgress = isExecuting || isApproving || isSigning || isMining;
  const disabled = Boolean(error) || inProgress;
  const dstPicker = useToggle();
  const gasPicker = useToggle();
  const messageFeeFiat = fiatStore.getFiatAmount(messageFee?.nativeFee);
  const onClose = () => {
    props.onClose();
    dstPicker.close();
  };
  return (
    <SlideIn
      topAdornment={<SlideInTitle>Transfer ({selection.length})</SlideInTitle>}
      height={680}
      {...props}
      onClose={onClose}
    >
      <SlideInContent>
        <ListContainer>
          <List>
            {selection.map((item) => (
              <ListItem key={assetKey(item.token)} item={item} disabled={inProgress} />
            ))}
          </List>
        </ListContainer>

        <Networks>
          <NetworkItem>
            <NetworkIcon chainId={srcChainId} size={32} />
            <Box sx={{ml: 1}}>
              From
              <NetworkName>{srcChain?.name}</NetworkName>
            </Box>
          </NetworkItem>
          <NetworkArrow>
            <Icon type='arrow' size={24} />
          </NetworkArrow>
          <NetworkItem>
            <NetworkIcon chainId={dstChainId} size={32} />
            <Box sx={{ml: 1}}>
              To
              <NetworkName>{dstChain?.name}</NetworkName>
            </Box>
            <Button
              variant='primary'
              size='md'
              disabled={isExecuting}
              sx={{ml: 'auto'}}
              onClick={dstPicker.open}
            >
              Change
            </Button>
          </NetworkItem>
        </Networks>
        <Details
          items={[
            {
              label: 'Gas on Destination',
              value: <GasOnDestinationDetailItem onClick={gasPicker.open} />,
            },
            {
              label: 'Transfer Fee',
              value: messageFeeFiat ? '$' + messageFeeFiat.value.toFixed(2) : '-',
            },
          ]}
          sx={{width: '100%', mb: 2}}
        />

        <Button
          variant='primary'
          onClick={() => {
            onftStore
              .bridge()
              .then(() => onftStore.clearSelection())
              .then(onClose);
          }}
          disabled={disabled}
          sx={{width: '100%', minHeight: '46px'}}
        >
          {error
            ? error.error
            : isApproving
            ? 'Approving...'
            : isSigning
            ? 'Signing...'
            : isMining
            ? 'Processing...'
            : 'Transfer'}
        </Button>
        <TransferStatusDialog open={isExecuting} />
        <DestinationPicker open={dstPicker.value} onClose={dstPicker.close} />
        <GasOnDestinationPicker open={gasPicker.value} onClose={gasPicker.close} />
      </SlideInContent>
    </SlideIn>
  );
});

// List item
const ImgContainer = styled('div', {name: 'ImgContainer'})({
  height: 40,
  width: 40,
  overflow: 'hidden',
  marginRight: 12,
});

const Title = styled('div', {name: 'Title'})<{constrained?: boolean}>(({theme, constrained}) => ({
  fontSize: 14,
  lineHeight: '20px',
  letterSpacing: '-0.02em',
  fontWeight: 500,
  color: theme.palette.text.primary,
  marginRight: 'auto',
  ...(constrained && {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    maxWidth: 171,
  }),
}));

const Caption = styled('div', {name: 'Caption'})(({theme}) => ({
  fontSize: 12,
  lineHepight: '16px',
  letterSpacing: '-0.02em',
  color: theme.palette.text.secondary,
}));

const Amount = styled(Caption, {name: 'Amount'})(({theme}) => ({
  color: theme.palette.text.primary,
}));

const RemoveBtn = styled('button', {name: 'RemoveBtn'})(({theme}) => ({
  fontSize: 12,
  lineHeight: '16px',
  color: theme.palette.text.secondary,
  border: 0,
  background: 'transparent',
  cursor: 'pointer',
  marginLeft: 16,
  justifySelf: 'flex-end',
  padding: 0,
  '&:hover': {
    color: theme.palette.text.primary,
  },
}));

const ListItemContainer = styled('div', {name: 'TransferModal-ListItemContainer'})(() => ({
  display: 'flex',
  alignItems: 'center',
  width: '100%',
}));

const ListItem: React.FC<{item: FormItem; disabled?: boolean}> = ({item, disabled}) => {
  switch (item.token.contract.standard) {
    case OnftStandard.ERC721:
      return <ERC721ListItem item={item} disabled={disabled} />;
    case OnftStandard.ERC1155:
      return <ERC1155ListItem item={item} disabled={disabled} />;
    default:
      return null;
  }
};

const ERC721ListItem: React.FC<{item: FormItem; disabled?: boolean}> = ({item, disabled}) => {
  const {data: metadata} = useAssetMetadata(item.token);
  const handleRemoveClick = useCallback(() => {
    onftStore.deselectAsset(item.token);
  }, [item]);
  return (
    <ListItemContainer>
      <ImgContainer>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={metadata?.image ?? '/static/token.svg'} alt={metadata?.name ?? ''} />
      </ImgContainer>
      <Box sx={{flex: 1}}>
        <Caption>ONFT</Caption>
        <Title>{metadata?.name ?? '--'}</Title>
      </Box>
      <RemoveBtn disabled={disabled} onClick={handleRemoveClick}>
        <Icon type='trash' size={16} />
      </RemoveBtn>
    </ListItemContainer>
  );
};

const ERC1155ListItem: React.FC<{item: FormItem; disabled?: boolean}> = observer(
  ({item, disabled}) => {
    const {data: metadata} = useAssetMetadata(item.token);
    const handleRemoveClick = () => onftStore.deselectAsset(item.token);
    const handlePlusClick = () => onftStore.increaseAssetAmount(item.token);
    const handleMinusClick = () => onftStore.decreaseAssetAmount(item.token);
    return (
      <ListItemContainer>
        <ImgContainer>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={metadata?.image ?? '/static/token.svg'} alt={metadata?.name ?? ''} />
        </ImgContainer>
        <Box>
          <Box flexDirection='row' display='flex' gap={1}>
            <Amount>{item.amount}</Amount>
            <Caption>ONFT</Caption>
          </Box>
          <Title constrained>{metadata?.name ?? '--'}</Title>
        </Box>
        <Box flexDirection='row' display='flex' gap={0.5} alignItems='center' ml='auto'>
          <CounterButton onClick={handleMinusClick} disabled={item.amount === 1}>
            <Icon type='minus' size={16} />
          </CounterButton>
          <CounterAmount>{item.amount}</CounterAmount>
          <CounterButton onClick={handlePlusClick} disabled={item.amount === item.maxAmount}>
            <Icon type='plus' size={16} />
          </CounterButton>
        </Box>
        <RemoveBtn disabled={disabled} onClick={handleRemoveClick}>
          <Icon type='trash' size={16} />
        </RemoveBtn>
      </ListItemContainer>
    );
  },
);

const CounterButton = styled('button', {name: 'CounterButton'})(({theme}) => ({
  width: 32,
  height: 32,
  padding: 0,
  border: `1px solid ${theme.palette.divider}`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: theme.palette.text.primary,
  backgroundColor: 'transparent',
  cursor: 'pointer',
  outline: 'none',
  '&:disabled': {
    color: theme.palette.divider,
  },
  '&:hover:not(:disabled)': {
    backgroundColor: theme.palette.divider,
  },
}));

const CounterAmount = styled('div', {name: 'CounterAmount'})(({theme}) => ({
  fontSize: 14,
  lineHeight: '20px',
  letterSpacing: '-0.02em',
  fontWeight: 500,
  color: theme.palette.text.primary,
  minWidth: 32,
  textAlign: 'center',
}));
