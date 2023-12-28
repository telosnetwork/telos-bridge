import {OnftToken} from '@layerzerolabs/ui-bridge-onft';
import {observer} from 'mobx-react';
import React from 'react';

import {useToggle} from '@/core/hooks/useToggle';
import {styled} from '@/core/ui/system';

import {useAllAssets} from '../hooks/useAllAssets';
import {useFilteredAssets} from '../hooks/useFilteredAssets';
import {onftStore} from '../stores/onftStore';
import {assetKey} from '../stores/utils';
import {BridgeTopBar} from './BridgeTopBar';
import {CardsGrid} from './CardsGrid';
import {NoAssetsPlaceholder} from './NoAssetsPlaceholder';
import {OnftCard} from './OnftCard';
import {OnftListHeader, OnftListItem} from './OnftListItem';
import {TransferModal} from './TransferModal';
import {ViewType} from './ViewTypeSwitch';

export const OnftBridge = observer(() => {
  const [viewType, setViewType] = React.useState(ViewType.Grid);
  const modal = useToggle();
  const allAssets = useAllAssets();
  const filteredAssets = useFilteredAssets(allAssets);
  const hasAssets = allAssets.length > 0;
  const {isAssetSelected, selectAsset, deselectAsset, canSelectAsset} = onftStore;

  const onSelectAsset = (asset: OnftToken) => {
    if (isAssetSelected(asset)) {
      deselectAsset(asset);
    } else {
      selectAsset(asset);
    }
  };

  const onTransfer = () => {
    const dstChainId = onftStore.dstNetworkOptions[0]?.chainId;
    onftStore.setDstChainId(dstChainId);
    modal.open();
  };

  const onClose = () => {
    onftStore.setDstChainId(undefined);
    modal.close();
  };

  return (
    <BridgeContainer>
      <BridgeTopBar
        onTransfer={onTransfer}
        viewType={viewType}
        setViewType={setViewType}
        sx={{mt: 15}}
      />
      {hasAssets ? (
        filteredAssets.length === 0 ? (
          <NoFilteredAssets>You don’t have any ONFTS on this network yet.</NoFilteredAssets>
        ) : viewType === ViewType.Grid ? (
          <CardsGrid>
            {filteredAssets.map((item) => {
              const selected = isAssetSelected(item.token);
              const disabled = !selected && !canSelectAsset(item.token);
              return (
                <OnftCard
                  key={assetKey(item.token)}
                  asset={item}
                  onClick={() => onSelectAsset(item.token)}
                  disabled={disabled}
                  selected={selected}
                />
              );
            })}
          </CardsGrid>
        ) : (
          <div>
            <OnftListHeader />
            {filteredAssets.map((item) => {
              const selected = isAssetSelected(item.token);
              const disabled = !selected && !canSelectAsset(item.token);
              return (
                <OnftListItem
                  key={assetKey(item.token)}
                  asset={item}
                  selected={selected}
                  disabled={disabled}
                  onClick={() => onSelectAsset(item.token)}
                />
              );
            })}
          </div>
        )
      ) : (
        <NoAssetsPlaceholder />
      )}
      <TransferModal open={modal.value} onClose={onClose} />
    </BridgeContainer>
  );
});

const NoFilteredAssets = styled('div')(({theme}) => ({
  color: theme.palette.text.secondary,
  fontWeight: 500,
  height: 506,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  ...theme.typography.p1,
}));

const BridgeContainer = styled('div', {name: 'ONFTBridge-BridgeContainer'})(({theme}) => ({
  width: '100%',
  paddingLeft: theme.spacing(2),
  paddingRight: theme.spacing(2),
  paddingBottom: theme.spacing(2),
  maxWidth: 1440,
  margin: '0 auto',
  flex: 1,
  [theme.breakpoints.up('md')]: {
    paddingLeft: theme.spacing(6),
    paddingRight: theme.spacing(6),
    paddingBottom: theme.spacing(10),
  },
}));
