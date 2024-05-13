import {Box} from '@mui/system';
import {observer} from 'mobx-react';

import {transactionStore} from '../stores/transactionStore';
import {uiStore, WalletTab} from '../stores/uiStore';
import {walletStore} from '../stores/walletStore';
import {formatAddress} from '../utils/formatAddress';
import {Button} from './Button';
import {Icon} from './Icon';
import {DesktopOnly} from './PageLayout';

export const ConnectButtons = observer(() => {
  const {pendingTransactions} = transactionStore;
  const {address} = walletStore.evm ?? {};
  const {isConnected} = walletStore;

  return (
    <Box sx={{display: 'flex', gap: 1, zIndex: 10, border: '1px solid rgba(0, 0, 0, 0.12)'}}>
      {address && pendingTransactions.length > 0 && (
        <Button size='lg' onClick={openTransactionsModal}>
          <DesktopOnly display='inline'>Pending&nbsp;</DesktopOnly>
          <Icon type='spinner' size={16} />
        </Button>
      )}
      {!isConnected && (
        <Button size='md' variant={address ? 'secondary' : 'primary'} onClick={openConnectModal}>
          Connect
        </Button>
      )}
      {address && pendingTransactions.length == 0 &&(
        <Button variant='secondary' size='lg' onClick={openConnectModal}>
          {formatAddress(address)}
        </Button>
      )}
    </Box>
  );
});

function openTransactionsModal() {
  uiStore.walletModal.setActiveTab(WalletTab.TRANSACTIONS);
  uiStore.walletModal.open();
}

const openConnectModal = () => {
  uiStore.walletModal.setActiveTab(WalletTab.WALLET);
  uiStore.walletModal.open();
};
