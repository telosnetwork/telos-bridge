import {Wallet} from '@layerzerolabs/ui-wallet';
import {observer} from 'mobx-react';
import * as React from 'react';

import {uiStore, WalletTab} from '@/core/stores/uiStore';
import {Box, styled} from '@/core/ui/system';
import {formatAddress} from '@/core/utils/formatAddress';

import {WalletIcon} from './WalletIcon';

type WalletDetailsProps = {
  wallet?: Wallet<unknown>;
};

const openWalletModal = () => {
  uiStore.walletModal.setActiveTab(WalletTab.WALLET);
  uiStore.walletModal.open();
};

export const WalletDetails = observer((props: WalletDetailsProps) => {
  const {wallet} = props;

  return (
    <Bar>
      <Box
        sx={{display: 'flex', alignItems: 'center', cursor: 'pointer'}}
        onClick={openWalletModal}
      >
        <WalletIcon type={wallet?.type} iconUrl={(wallet as any)?.icon} size={10} />
        <Box typography='p2' color='text.secondary' sx={{ml: 1}}>
          {wallet?.address && formatAddress(wallet.address, 9)}
        </Box>
      </Box>
      <Box
        typography='link'
        color='text.secondary'
        onClick={wallet ? () => wallet.disconnect() : openWalletModal}
        sx={(t) => t.typography.p2}
      >
        {wallet ? 'Disconnect' : 'Connect'}
      </Box>
    </Bar>
  );
});

const Bar = styled('div', {name: 'WalletInfoBar-Bar'})(({theme}) => ({
  display: 'flex',
  justifyContent: 'space-between',
  marginBottom: theme.spacing(1),
}));
