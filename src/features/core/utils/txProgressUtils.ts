import {now} from 'mobx-utils';

import {Transaction} from '@/core/stores/transactionStore';

export function liveTimeStamp() {
  return Math.floor(now() / 1000);
}

export function getTxRemainingTime(tx: Pick<Transaction, 'expectedDate'>) {
  if (!tx.expectedDate) return undefined;
  const now = liveTimeStamp();
  const remaining = tx.expectedDate - now;
  if (!Number.isFinite(remaining)) return undefined;
  return Math.max(remaining, 0);
}

export function getTxProgress(tx: Transaction): number {
  if (!tx.submittedDate || !tx.expectedDate) return 0;
  if (tx.error) return 0;
  const now = liveTimeStamp();
  const elapsed = Math.max(now - tx.submittedDate, 0);
  const duration = Math.max(tx.expectedDate - tx.submittedDate, 0);
  const progress = elapsed / duration;
  if (!isFinite(progress)) return 0;
  return Math.min(progress, 1);
}
