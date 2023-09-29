function parseWalletErrorTitle(e: unknown) {
  const title = (e as any)?.code === 4001 ? 'Transaction rejected' : 'Transaction failed';
  return title;
}

function parseWalletErrorMessage(e: unknown) {
  const any = e as any;
  const code: string | undefined = any?.code;
  if (code && typeof code === 'string') {
    if (code === 'INSUFFICIENT_FUNDS') {
      return ErrorMessage.INSUFFICIENT_FUNDS;
    }
  }
  const reason: string | undefined = any?.reason;
  if (reason && typeof reason === 'string') {
    return reason;
  }
  const message: string | undefined = any?.message || any?.data?.message;
  if (message && typeof message === 'string') {
    if (typeof message === 'string') {
      // aptos
      if (message.includes('INSUFFICIENT_BALANCE_FOR_TRANSACTION_FEE')) {
        return ErrorMessage.INSUFFICIENT_FUNDS;
      }
      // aptos
      if (message.includes('RejectedByUser')) {
        return ErrorMessage.REJECTED_BY_USER;
      }
      if (message.includes('insufficient funds for gas')) {
        return ErrorMessage.INSUFFICIENT_FUNDS;
      }
    }
    return message;
  }
  // last resort
  const error = String(e ?? 'Unknown error');
  return error;
}

enum ErrorMessage {
  INSUFFICIENT_FUNDS = 'Insufficient funds for gas. Make sure you have enough gas.',
  REJECTED_BY_USER = 'Transaction was rejected.',
}

export function parseWalletError(e: unknown): {title: string; message: string} {
  const title = parseWalletErrorTitle(e);
  const message = parseWalletErrorMessage(e);
  return {title, message};
}
