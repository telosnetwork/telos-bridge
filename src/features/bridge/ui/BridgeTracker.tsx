import type {TransferInput} from '@layerzerolabs/ui-bridge-sdk';
import {formatCurrencyAmount, isToken} from '@layerzerolabs/ui-core';
import {observer} from 'mobx-react';

import {unclaimedStore} from '@/bridge/stores/unclaimedStore';
import {Transaction} from '@/core/stores/transactionStore';
import {uiStore} from '@/core/stores/uiStore';
import {walletStore} from '@/core/stores/walletStore';
import {Button} from '@/core/ui/Button';
import {Tracker as TrackerBase, TrackerProps} from '@/core/ui/Tracker';
import {TrackerCarousel, TrackerCarouselProps} from '@/core/ui/TrackerCarousel';

export type BridgeTrackerProps = Omit<TrackerCarouselProps, 'txs'>;

export const BridgeTracker: React.FC<BridgeTrackerProps> = observer((props) => {
  return (
    <TrackerCarousel
      {...props}
      txs={uiStore.txProgress.transactions}
      renderTracker={renderTracker}
    />
  );
});

function renderTracker(tx: Transaction) {
  return <Tracker tx={tx} key={tx.txHash} />;
}

function isTransferInput(input: unknown): input is TransferInput {
  if (!input) return false;
  const tx = input as TransferInput;
  // naive
  return Boolean(tx.srcChainId && tx.dstChainId && tx.srcAddress && tx.dstAddress && tx.amount);
}

export const Tracker: React.FC<TrackerProps> = observer(({tx, ...props}) => {
  const input = tx.input;
  if (!isTransferInput(input)) {
    // default on close if txHash provided
    const onClose =
      props.onClose ?? tx.txHash ? () => uiStore.txProgress.dismiss(tx.txHash) : undefined;
    return <TrackerBase tx={tx} {...props} onClose={onClose} />;
  }

  const isUnclaimed = unclaimedStore.isUnclaimed(input.dstCurrency);
  const isDstWalletConnected = walletStore.active.some((w) => w.address === input.dstAddress);

  return (
    <TrackerBase
      {...props}
      tx={tx}
      onClose={
        !isUnclaimed && (tx.completed || tx.error)
          ? () => uiStore.txProgress.dismiss(tx.txHash)
          : undefined
      }
      status={
        isDstWalletConnected && tx.completed && isToken(input.dstCurrency) && isUnclaimed ? (
          <Button
            size='sm'
            sx={{marginTop: -2.5}}
            variant='primary'
            onClick={() => unclaimedStore.claim(input.dstCurrency)}
          >
            Claim
          </Button>
        ) : undefined // use the default status if no claim is available
      }
    >
      {input.amount ? formatCurrencyAmount(input.amount) + ' ' + input.amount.currency.symbol : ''}
    </TrackerBase>
  );
});
