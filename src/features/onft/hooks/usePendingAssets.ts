import {OnftTokenAmount} from '@layerzerolabs/ui-bridge-onft';

import {onftStore} from '../stores/onftStore';

export function usePendingAssets(): OnftTokenAmount[] {
  return onftStore.inflight.flatMap((t) => t.assets);
}
