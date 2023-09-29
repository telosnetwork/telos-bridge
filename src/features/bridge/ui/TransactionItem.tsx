import type {TransferInput} from '@layerzerolabs/ui-bridge-sdk';
import {getScanLink, getTransactionLink} from '@layerzerolabs/ui-core';
import {observer} from 'mobx-react';

import {Transaction} from '@/core/stores/transactionStore';
import {Icon} from '@/core/ui/Icon';
import {Box, Stack} from '@/core/ui/system';

interface TransactionItemProps {
  tx: Transaction;
}

// naive
function isCrossChainTx(
  tx: Transaction,
): tx is Transaction<{srcChainId: number; dstChainId: number}> {
  const input = tx.input as any;
  if (input && input.srcChainId && input.dstChainId) return true;
  return false;
}

// naive
function isBridgeTransaction(tx: Transaction): tx is Transaction<TransferInput> {
  if (!isCrossChainTx(tx)) return false;
  const input = tx.input as TransferInput;
  if (!input.amount) return false;
  if (!input.srcCurrency) return false;
  if (!input.dstCurrency) return false;
  return true;
}

export const TransactionItem = observer(({tx}: TransactionItemProps) => {
  const isSuccess = tx.completed;
  const isError = !!tx.error;
  const isPending = !isError && !isSuccess;
  const link = isCrossChainTx(tx)
    ? getScanLink(tx.chainId, tx.txHash)
    : getTransactionLink(tx.chainId, tx.txHash);

  const input: TransferInput | undefined = isBridgeTransaction(tx) ? tx.input : undefined;

  return (
    <Box sx={{display: 'flex', mb: 2, width: '100%'}}>
      <a href={link} target='_blank' rel='noreferrer'>
        <Icon type='blockchainExplorer' size={16} sx={{color: (t) => t.palette.text.secondary}} />
      </a>
      <Box
        typography='p3'
        sx={{flex: 1, ml: 1, mr: 2}}
        color={isSuccess ? 'text.primary' : 'text.secondary'}
      >
        <Stack direction='row' justifyContent='space-between'>
          <Box>{tx.type}</Box>
          <Box> {input && `${input.amount.toSignificant()} ${input.srcCurrency.symbol}`}</Box>
        </Stack>
      </Box>

      {isSuccess && (
        <Icon
          type='success'
          size={16}
          sx={(t) => ({
            color: t.palette.primary.contrastText,
            fill: t.palette.text.secondary,
          })}
        />
      )}
      {isPending && <Icon type='spinner' size={16} />}
      {isError && <Icon type='error' size={16} />}
    </Box>
  );
});
