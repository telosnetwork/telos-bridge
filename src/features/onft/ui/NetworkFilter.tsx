import {ChainId} from '@layerzerolabs/lz-sdk';
import {OnftTokenAmount} from '@layerzerolabs/ui-bridge-onft';
import {tryGetNetwork} from '@layerzerolabs/ui-core';
import {groupBy} from 'lodash-es';
import {observer} from 'mobx-react';
import React, {useMemo} from 'react';

import {Icon} from '@/core/ui/Icon';
import {NetworkIcon} from '@/core/ui/NetworkIcon';
import {Box, styled} from '@/core/ui/system';
import {useAllAssets} from '@/onft/hooks/useAllAssets';
import {onftStore} from '@/onft/stores/onftStore';

const getChainId = (asset: OnftTokenAmount): ChainId => asset.token.contract.chainId;

const NetworkFilterRoot = styled('div', {name: 'NetworkFilterRoot'})(({theme}) => ({
  display: 'flex',
  flexWrap: 'nowrap',
  overflowX: 'auto',
  overflowY: 'hidden',
  gap: '20px',
  width: '100vw',
  padding: '0 16px',
  '&::-webkit-scrollbar': {
    display: 'none',
  },
  '&::-webkit-scrollbar-track': {
    display: 'none',
  },
  '&::-webkit-scrollbar-thumb': {
    display: 'none',
  },
  '&::-webkit-scrollbar-thumb:hover': {
    display: 'none',
  },
  [theme.breakpoints.up('md')]: {
    gap: 32,
    width: 'auto',
    maxWidth: '100%',
    padding: 0,
  },
}));

export const NetworkFilter: React.FC = observer(() => {
  const allChainIds = onftStore.chains;
  const allAssets = useAllAssets();
  const assetsByChainId = useMemo(() => groupBy(allAssets, getChainId), [allAssets]);
  return (
    <NetworkFilterRoot>
      <NetworkFilterTab label='All chains' count={allAssets.length} />
      {allChainIds.map((chainId) => (
        <NetworkFilterTab
          key={chainId}
          chainId={chainId}
          label={tryGetNetwork(chainId)?.name}
          count={assetsByChainId[chainId]?.length ?? 0}
        />
      ))}
    </NetworkFilterRoot>
  );
});

interface NetworkFilterTabProps {
  chainId?: ChainId;
  count: number;
  label?: string;
}

const NetworkFilterTab: React.FC<NetworkFilterTabProps> = observer(({chainId, label, count}) => {
  const selected = onftStore.filters.chainId === chainId;
  return (
    <NetworkFilterTabButton
      onClick={() => onftStore.filters.setChainId(chainId)}
      selected={selected}
      type='button'
    >
      {chainId ? (
        <NetworkIcon size={32} chainId={chainId} sx={{marginRight: '12px'}} />
      ) : (
        <AllChainsIcon />
      )}
      {label} ({count})
    </NetworkFilterTabButton>
  );
});

const NetworkFilterTabButton = styled('button', {name: 'NetworkFilterTabButton'})<{
  selected?: boolean;
}>(({theme, selected}) => ({
  opacity: selected ? 1 : 0.4,
  cursor: 'pointer',
  whiteSpace: 'nowrap',
  display: 'flex',
  alignItems: 'center',
  flexShrink: 0,
  transition: 'opacity 100ms ease-in',
  backgroundColor: 'transparent',
  color: theme.palette.text.primary,
  border: 0,
  padding: 0,
  ...theme.typography.p1,
  '&:hover': {
    opacity: 1,
  },
}));

const AllChainsIcon = () => {
  return (
    <Box
      sx={{
        width: 32,
        height: 32,
        border: (t) => `1px solid ${t.palette.text.primary}`,
        display: 'grid',
        placeItems: 'center',
        mr: 1.5,
      }}
    >
      <Icon type='cube' size={16} />
    </Box>
  );
};
