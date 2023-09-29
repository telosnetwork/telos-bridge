import {bridgeStore} from '@/bridge/stores/bridgeStore';
import {fiatStore} from '@/core/stores/fiatStore';
import {tokenStore} from '@/core/stores/tokenStore';
import {transactionStore} from '@/core/stores/transactionStore';
import {walletStore} from '@/core/stores/walletStore';

if (typeof window !== 'undefined') {
  Object.assign(window, {
    app: {
      bridgeStore,
      walletStore,
      transactionStore,
      tokenStore,
      fiatStore,
    },
  });
}
