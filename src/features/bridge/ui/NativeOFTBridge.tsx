import {observer} from 'mobx-react';
import {useCallback, useState} from 'react';

import {useDefaultSrcCurrency} from '@/bridge/hooks/useDefaultSrcCurrency';
import {nativeBridgeStore} from '@/bridge/stores/nativeBridgeStore';
import {CurrencySelect} from '@/bridge/ui/CurrencySelect';
import {fiatStore, FiatSymbol} from '@/core/stores/fiatStore';
import {uiStore} from '@/core/stores/uiStore';
import {Button} from '@/core/ui/Button';
import {Details} from '@/core/ui/Details';
import {Input, InputAdornment} from '@/core/ui/Input';
import {InputsGroup} from '@/core/ui/InputsGroup';
import {SwapButton} from '@/core/ui/SwapButton';
import {Box} from '@/core/ui/system';
import {WalletDetails} from '@/core/ui/WalletDetails';

import {Alerts} from './Alerts';
import {GasOnDestinationButton} from './GasOnDestinationButton';
import {NetworkSelect} from './NetworkSelect';

export const NativeOFTBridge = observer(() => {
  const {
    errors,
    isApproving,
    isExecuting,
    outputAmount,
    srcWallet,
    dstWallet,
    dstAddress,
    messageFee,
  } = nativeBridgeStore;
  const [error] = errors;
  const nativeFee = messageFee?.nativeFee;
  const feeFiat = fiatStore.getFiatAmount(nativeFee);
  useDefaultSrcCurrency();

  const [fiatSymbol, setFiatSymbol] = useState(FiatSymbol.USD);
  const outputFiat = fiatStore.getFiatAmount(outputAmount, fiatSymbol);

  const handleSetUsd = useCallback(() => setFiatSymbol(FiatSymbol.USD), [setFiatSymbol]);
  const handleSetEur = useCallback(() => setFiatSymbol(FiatSymbol.EUR), [setFiatSymbol]);

  return (
    <Box display='flex' flexDirection='column'>
      <WalletDetails wallet={srcWallet} />
      <InputsGroup>
        <InputsGroup.Top>
          <CurrencySelect
            sx={{flex: 2}}
            groups={nativeBridgeStore.srcCurrencyOptionsGroups}
            value={nativeBridgeStore.form.srcCurrency}
            onSelect={nativeBridgeStore.setSrcCurrency}
          />
          <NetworkSelect
            sx={{flex: 1}}
            options={nativeBridgeStore.srcNetworkOptions}
            icon={false}
            onSelect={nativeBridgeStore.setSrcChainId}
            value={nativeBridgeStore.form?.srcChainId}
          />
        </InputsGroup.Top>
        <InputsGroup.Bottom>
          <Input
            size='lg'
            placeholder='0'
            startAdornment={
              <Button size='xs' variant='tertiary' onClick={nativeBridgeStore.setMaxAmount}>
                Max
              </Button>
            }
            onChange={(event) => nativeBridgeStore.setAmount(event.target.value)}
            value={nativeBridgeStore.form.amount}
            endAdornment={
              <InputAdornment>
                <Box color='text.secondary' typography='p3'>
                  Balance
                </Box>
                <Box color='text.secondary' typography='p3'>
                  {nativeBridgeStore.srcBalance?.toExact() ?? '--'}
                </Box>
              </InputAdornment>
            }
          />
        </InputsGroup.Bottom>
      </InputsGroup>
      <SwapButton onClick={nativeBridgeStore.switch} />
      <WalletDetails wallet={dstWallet} />
      <InputsGroup>
        <InputsGroup.Top>
          <CurrencySelect
            sx={{flex: 2}}
            groups={nativeBridgeStore.dstCurrencyOptionsGroups}
            onSelect={nativeBridgeStore.setDstCurrency}
            value={nativeBridgeStore.form.dstCurrency}
          />
          <NetworkSelect
            sx={{flex: 1}}
            options={nativeBridgeStore.dstNetworkOptions}
            onSelect={nativeBridgeStore.setDstChainId}
            icon={false}
            value={nativeBridgeStore.form.dstChainId}
          />
        </InputsGroup.Top>
        <InputsGroup.Bottom>
          <Input
            size='lg'
            value={outputAmount?.toExact() ?? '-'}
            readOnly
            endAdornment={
              <InputAdornment>
                <Box typography='p3' sx={{gap: 1, display: 'flex'}}>
                  <Box
                    component='span'
                    color={fiatSymbol === FiatSymbol.USD ? 'text.primary' : 'text.secondary'}
                    onClick={handleSetUsd}
                    sx={{cursor: 'pointer'}}
                  >
                    USD
                  </Box>
                  <Box
                    component='span'
                    color={fiatSymbol === FiatSymbol.EUR ? 'text.primary' : 'text.secondary'}
                    onClick={handleSetEur}
                    sx={{cursor: 'pointer'}}
                  >
                    EUR
                  </Box>
                </Box>
                <Box color='text.secondary' typography='p3'>
                  {outputFiat?.value.toFixed(2) ?? '--'}
                </Box>
              </InputAdornment>
            }
          />
        </InputsGroup.Bottom>
      </InputsGroup>
      <Details
        sx={{my: '24px'}}
        items={[
          {
            label: 'Gas on destination',
            value: <GasOnDestinationButton />,
          },
          {
            label: 'You will receive',
            value: outputAmount
              ? outputAmount.toExact() + ' ' + fiatStore.getSymbol(outputAmount.currency)
              : '--',
          },
          {
            label: 'Fee',
            value: feeFiat
              ? feeFiat.value.toFixed(2) + ' USD'
              : nativeFee
              ? nativeFee.toSignificant(8) + ' ' + fiatStore.getSymbol(nativeFee.currency)
              : '--',
          }
        ] 
      }
      />
      {srcWallet?.address && dstAddress ? (
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
          <Button variant='primary' type='button' onClick={nativeBridgeStore.transfer}>
            Transfer
          </Button>
        )
      ) : error ? (
        <Button variant='primary' type='button' disabled>
          {error}
        </Button>
      ) : (
        <Button variant='primary' type='button' onClick={uiStore.walletModal.open}>
          {'Connect'}
        </Button>
      )}
      <Alerts />
    </Box>
  );
});
