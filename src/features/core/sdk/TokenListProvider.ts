import {
  GetTokenListOptions,
  TokenList,
  TokenListItem,
  TokenListProvider as ITokenListProvider,
} from '@layerzerolabs/ui-core';

import {trpcClient} from '../utils/trpc';

export class TokenListProvider implements ITokenListProvider {
  async getTokenList(options?: GetTokenListOptions | undefined): Promise<TokenList<TokenListItem>> {
    return trpcClient.tokens.query();
  }
}
