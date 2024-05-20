import {Wallet} from '@layerzerolabs/ui-wallet';
import {groupBy} from 'lodash-es';
import {observer} from 'mobx-react';
import React, {useEffect, useRef, useState} from 'react';

import { BraveWallet, WalletType } from '@/core/config/createWallets';
import {transactionStore} from '@/core/stores/transactionStore';
import {uiStore, WalletTab} from '@/core/stores/uiStore';
import {walletStore} from '@/core/stores/walletStore';
import {Button} from '@/core/ui/Button';
import {Icon} from '@/core/ui/Icon';
import {Input} from '@/core/ui/Input';
import {Modal, ModalProps} from '@/core/ui/Modal';
import {Box, SxProps} from '@/core/ui/system';
import {Tabs} from '@/core/ui/Tabs';
import {WalletIcon} from '@/core/ui/WalletIcon';
import {formatAddress} from '@/core/utils/formatAddress';
import {isMobile} from '@/core/utils/platform';

import {TransactionItem} from './TransactionItem';

export type AccountModalProps = Omit<ModalProps, 'title' | 'children'> & {title?: string};

export const AccountModal = observer(({title = 'Connect Wallet', ...props}: AccountModalProps) => {
  const {...modalProps} = props;
  const {wallets} = walletStore;

  const walletGroups = Object.entries(
    groupBy(Object.values(wallets), (wallet) => wallet.chainType),
  ).map(([chainType, wallets]) => {
    const connected = wallets.find((w) => w.isConnected || w.isConnecting);

    return {
      chainType: chainType,
      active: connected,
      wallets: connected ? [connected] : wallets,
    };
  });

  return (
    <Modal title={title} overlay {...modalProps}>
      <Tabs
        activeTab={uiStore.walletModal.activeTab}
        setActiveTab={(tab) => uiStore.walletModal.setActiveTab(tab as WalletTab)}
        sx={{mx: 2}}
      >
        <Tabs.Tab title={WalletTab.WALLET}>
          <Box sx={{width: '100%'}}>
            {walletGroups.map((group) => (
              <WalletGroup
                key={group.chainType}
                isConnected={group.active?.isConnected || false}
                onDisconnect={group.active?.disconnect}
                heading={
                  <Box typography='p3' color='text.secondary'>
                    {group.chainType}
                  </Box>
                }
              >
                {group.wallets.map((wallet) => {
                  return <WalletItem key={wallet.type} wallet={wallet} />;
                })}
              </WalletGroup>
            ))}
          </Box>
        </Tabs.Tab>
        <Tabs.Tab title={WalletTab.TRANSACTIONS}>
          <Box sx={{width: '100%'}}>
            {transactionStore.recentTransactions.map((tx, index) => (
              <TransactionItem tx={tx} key={tx.txHash ?? index} />
            ))}
          </Box>
        </Tabs.Tab>
      </Tabs>
    </Modal>
  );
});

type WalletGroupProps = React.PropsWithChildren<{
  heading: React.ReactNode;
  isConnected?: boolean;
  onDisconnect?: () => void;
  onPasteAccount?: (value: string) => void;
  sx?: SxProps;
}>;

const WalletGroup: React.FC<WalletGroupProps> = ({
  children,
  heading,
  isConnected,
  onDisconnect,
  onPasteAccount,
  sx,
}) => {
  const [isPaste, setIsPaste] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (isPaste) inputRef.current?.focus();
  }, [isPaste]);
  return (
    <Box sx={sx}>
      <Box sx={{display: 'flex', justifyContent: 'space-between'}}>
        {heading}
        <Box>
          {isConnected ? (
            <Button variant='incognito' onClick={onDisconnect}>
              <Box typography='p3' color='text.secondary'>
                Disconnect
              </Box>
            </Button>
          ) : onPasteAccount ? (
            <Button variant='incognito' onClick={() => setIsPaste(!isPaste)}>
              <Box typography='p3' color='text.secondary'>
                or{' '}
              </Box>
              <Box typography='p3'>{isPaste ? 'Connect Wallet' : 'Paste Account'}</Box>
            </Button>
          ) : null}
        </Box>
      </Box>
      <Box sx={{mt: 1}}>
        <Input
          ref={inputRef}
          size='md'
          placeholder='Paste Address'
          endAdornment={<InputStateAdornment type='success' />}
          sx={{height: 56, display: isPaste ? undefined : 'none'}}
        />

        {!isPaste && children}
      </Box>
    </Box>
  );
};

const InputStateAdornment: React.FC<{type?: 'pending' | 'success' | 'error'}> = ({type}) => {
  if (!type) {
    return null;
  }
  if (type === 'pending') {
    return <Icon type='spinner' size={16} />;
  }
  if (type === 'success') {
    return <Icon type='checkmark' size={16} sx={{color: (t) => t.palette.success.main}} />;
  }
  if (type === 'error') {
    return <Icon type='info' size={16} sx={{color: (t) => t.palette.warning.main}} />;
  }
  return null;
};

const WalletItem: React.FC<{
  wallet: Wallet<unknown>;
}> = observer(({wallet}) => {
  const mobile = isMobile();

  if (wallet.type === 'Core' && mobile) {
    // https://github.com/telosnetwork/telos-bridge/issues/20
    return null;
  }

  let buttonText;
  const win = window as any;

  const isSafePal = win.ethereum?.isSafePal;
  const isBraveBrowser = win.navigator.brave;
  const isBraveWallet = win.ethereum?.isBraveWallet;

  if (wallet.isConnecting) {
    buttonText = 'Connecting...';
  } else if (wallet.isConnected && wallet.address) {
    buttonText = `${formatAddress(wallet.address, 16)}`;
  // handle safepal extension conflict
  } else if (wallet.type === WalletType.METAMASK && isSafePal){
    buttonText = `Get MetaMask Wallet`;
  } else if (wallet.isAvailable || (wallet.type === WalletType.BRAVE && isBraveWallet)) {
    buttonText = `Connect ${wallet.type}`;
  } else if (!mobile) {
    buttonText = `Get ${wallet.type} Wallet`;
  } else {
    buttonText = `Continue on ${wallet.type}`;
  }

  function handleButtonClick() {
    if (wallet.isConnected) {
      wallet.disconnect();
      return;
    }
    // handle safepal extension conflict
    if (wallet.type === WalletType.METAMASK && isSafePal){
      window.open('https://metamask.app.link/dapp/bridge.telos.net');
      return;
    }
    if (isBraveBrowser && isBraveWallet){
      (wallet as BraveWallet).setProvider(WalletType.BRAVE, win.ethereum);
    }
    if (wallet.isAvailable || isBraveWallet) {
      wallet.connect();
      return;
    }

    if (wallet.type === WalletType.METAMASK) {
      window.open('https://metamask.app.link/dapp/bridge.telos.net');
    } else if (wallet.type === WalletType.COINBASE) {
      window.open('https://go.cb-w.com/dapp?cb_url=bridge.telos.net');
    } else if (wallet.type === WalletType.PHANTOM) {
      window.open('https://phantom.app/ul/');
    }else if (wallet.type === WalletType.SAFEPAL){
      window.open('https://www.safepal.com/en/download');
    }else if (wallet.type === WalletType.BRAVE){
      window.open((wallet as any).url);
    }
  }

  return (
    <Button
      variant='incognito'
      onClick={handleButtonClick}
      sx={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
        border: (theme) => `1px solid ${theme.palette.divider}`,
        padding: 1.5,
        mb: 1,
      }}
    >
      <WalletIcon type={wallet.type} iconUrl={(wallet as any).icon} />
      <Box typography='p2' sx={{ml: 2}}>
        {buttonText}
      </Box>
    </Button>
  );
});
