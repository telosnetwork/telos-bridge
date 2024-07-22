import {isAptosChainId, tryGetNetwork} from '@layerzerolabs/ui-core';
import {observer} from 'mobx-react';

import {bridgeStore} from '@/bridge/stores/bridgeStore';
import {fiatStore} from '@/core/stores/fiatStore';
import {uiStore} from '@/core/stores/uiStore';
import {Alert, AlertType} from '@/core/ui/Alert';
import {Button} from '@/core/ui/Button';
import {Box} from '@/core/ui/system';

export const Alerts = observer(() => {
  const {amount, form, srcWallet} = bridgeStore;
  return (
    <>
      <Alert
        key='transfer'
        open={bridgeStore.isExecuting}
        type={AlertType.LOADING}
        title={
          srcWallet?.isSwitchingChain
            ? 'Switch chain'
            : bridgeStore.isRegistering
            ? 'Register token first'
            : bridgeStore.isResetting
            ? 'Setting Allowance'
            : bridgeStore.isApproving
            ? 'Awaiting Allowance Confirmation'
            : bridgeStore.isMining
            ? 'Submitting transaction'
            : 'Confirm Bridge Transaction'
        }
      >
        <div>
          Transferring {amount?.toSignificant()} {fiatStore.getSymbol(amount?.currency)} from{' '}
          {tryGetNetwork(form.srcChainId)?.name} to {tryGetNetwork(form.dstChainId)?.name}
        </div>

        {bridgeStore.isRegistering ? (
          <Box typography='p3' sx={{mt: 2}} color='text.secondary'>
            Asset registration is only required during your first interaction with an asset on
            Aptos. This is a mandatory Aptos security measure that will keep your wallet secure.
          </Box>
        ) : form.srcChainId && isAptosChainId(form.srcChainId) ? (
          <Box typography='p3' sx={{mt: 2}} color='success.main'>
            Transfers from Aptos are subject to a 3 day transfer window and will be available in 72
            hours.
          </Box>
        ) : null}

        <Box color='text.secondary' typography='p3' sx={{mt: 3}}>
          {srcWallet?.isSwitchingChain ? (
            'Please check pending wallet actions if you did not receive a transaction prompt.'
          ) : bridgeStore.isRegistering ? (
            'Confirm this transaction in your wallet'
          ) : bridgeStore.isResetting ? (
            'First approve this reset transaction in your wallet.'
          ) : bridgeStore.isApproving ? (
            'Approve this transaction in your wallet.'
          ) : bridgeStore.isSigning ? (
            'Please check pending wallet actions if you did not receive a transaction prompt.'
          ) : bridgeStore.isMining ? (
            'Waiting for blockchain confirmation...'
          ) : (
            <>&nbsp;</>
          )}
        </Box>
      </Alert>

      <Alert
        key='rpc-error'
        open={uiStore.rpcErrorAlert.value}
        title='Something went wrong'
        type={AlertType.ERROR}
      >
        <Box typography='p3' color='text.secondary' sx={{marginBottom: '24px', maxWidth: '432px'}}>
          The network is congested right now. Please wait 5 minutes and refresh the page again.
        </Box>
        <Button
          onClick={uiStore.rpcErrorAlert.close}
          variant='primary'
          sx={{width: '204px', height: '40px', marginTop: 'auto'}}
        >
          OKAY
        </Button>
      </Alert>
    </>
  );
});
