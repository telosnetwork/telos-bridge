import {getNetwork} from '@layerzerolabs/ui-core';
import {observer} from 'mobx-react';
import React, {useEffect} from 'react';

import {fiatStore} from '@/core/stores/fiatStore';
import {uiStore} from '@/core/stores/uiStore';
import {getWalletBalance} from '@/core/stores/utils';
import {Button} from '@/core/ui/Button';
import {Details} from '@/core/ui/Details';
import {Input, InputAdornment} from '@/core/ui/Input';
import {InputsGroup} from '@/core/ui/InputsGroup';
import {ListItem} from '@/core/ui/ListItem';
import {NetworkIcon} from '@/core/ui/NetworkIcon';
import {Panel} from '@/core/ui/Panel';
import {Box} from '@/core/ui/system';

import {bridgeStore} from '../stores/bridgeStore';
import {Alerts} from './Alerts';
import {GasOnDestinationButton} from './GasOnDestinationButton';
import {GasPrice} from './GasPrice';
import {NetworkSelect, NetworkSelectOption} from './NetworkSelect';

// OFT
const symbol = 'LVC';

export const OFTBridge = observer(() => {
  useEffect(() => {
    const srcCurrency = bridgeStore.currencies.find((i) => i.symbol === symbol);
    if (!srcCurrency) return;
    bridgeStore.setSrcCurrency(srcCurrency);
  }, []);

  const feeFiat = fiatStore.getFiatAmount(bridgeStore.messageFee?.nativeFee);
  const [error] = bridgeStore.errors;
  const {isApproving, isExecuting, srcWallet, form} = bridgeStore;

  return (
    <>
      <Panel title={`Transfer ${form.srcCurrency?.symbol ?? ''}`} endAdornment={<GasPrice />}>
        <InputsGroup.Top>
          <NetworkSelect
            key='src'
            sx={{flex: 1}}
            options={bridgeStore.chains}
            onSelect={bridgeStore.setSrcChainId}
            value={bridgeStore.form.srcCurrency?.chainId}
            renderOption={renderOption}
            title='From'
          />
          <NetworkSelect
            key='dst'
            sx={{flex: 1}}
            options={bridgeStore.chains}
            onSelect={bridgeStore.setDstChainId}
            value={bridgeStore.form.dstCurrency?.chainId}
            renderOption={renderOption}
            title='To'
          />
        </InputsGroup.Top>
        <Input
          size='lg'
          sx={{mt: '24px'}}
          placeholder='0'
          startAdornment={
            <Button size='xs' variant='tertiary' onClick={bridgeStore.setMaxAmount}>
              Max
            </Button>
          }
          onChange={(event) => bridgeStore.setAmount(event.target.value)}
          value={bridgeStore.form.amount}
          endAdornment={
            <InputAdornment>
              <Box color='text.secondary' typography='p3'>
                Balance
              </Box>
              <Box color='text.secondary' typography='p3'>
                {bridgeStore.maxAmount?.toExact() ?? '-'}
              </Box>
            </InputAdornment>
          }
        />
        <Details
          sx={{my: '24px'}}
          items={[
            {
              label: 'Gas on destination',
              value: <GasOnDestinationButton />,
            },
            {label: 'You will receive', value: bridgeStore.outputAmount?.toExact()},
            {label: 'Fee', value: feeFiat?.value.toFixed(2) ?? '--'},
          ]}
        />
        {srcWallet?.isConnected ? (
          error ? (
            <Button variant='primary' type='button' disabled>
              {error}
            </Button>
          ) : isApproving ? (
            <Button variant='primary' type='button'>
              Approving ...
            </Button>
          ) : isExecuting ? (
            <Button variant='primary' type='button'>
              Sending ...
            </Button>
          ) : (
            <Button variant='primary' type='button' onClick={bridgeStore.transfer}>
              Transfer
            </Button>
          )
        ) : (
          <Button variant='primary' type='button' onClick={uiStore.walletModal.open}>
            Connect
          </Button>
        )}
        {!srcWallet && (
          <Box typography='p3' color='text.secondary' sx={{textAlign: 'center', mt: 3}}>
            Connect wallet to mint OFT tokens and start transferring.
          </Box>
        )}
      </Panel>
      <Alerts />
    </>
  );
});

const renderOption = ({chainId}: NetworkSelectOption) => {
  const network = getNetwork(chainId);
  const token = bridgeStore.currencies.find((i) => i.chainId === chainId && i.symbol === symbol);
  const tokenBalance = getWalletBalance(token);
  const fiatBalance = fiatStore.getFiatAmount(tokenBalance);
  return (
    <ListItem
      startAdornment={<NetworkIcon chainId={chainId} size={32} />}
      overlay={token ? undefined : `${symbol} is not available`}
      disabled={!token}
      topLeft={network.name}
      topRight={fiatBalance?.value.toFixed(2)}
      bottomLeft={network.symbol.toUpperCase()}
      bottomRight={tokenBalance?.toExact()}
    />
  );
};
