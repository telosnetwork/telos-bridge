import {
  chainKeyToEndpointId,
  Coin,
  Currency,
  Token,
  TokenListItem,
  TokenListProvider,
} from '@layerzerolabs/ui-core';
import assert from 'assert';
import {flow, makeAutoObservable, ObservableMap} from 'mobx';

// Contains information about tokens and coins with some metadata
export class TokenStore {
  tokens: Currency[] = [];
  tokenDetails = new ObservableMap<string, TokenListItem>();
  provider: TokenListProvider | undefined = undefined;

  constructor() {
    makeAutoObservable(this);
  }

  addProviders([provider]: [TokenListProvider]) {
    assert(!this.provider, 'Only one TokenListProvider is supported');
    this.provider = provider;
  }

  getDetails(token: Currency): TokenListItem | undefined {
    return this.tokenDetails.get(token.id);
  }

  updateTokens = flow(
    function* (this: TokenStore) {
      const {provider} = this;
      assert(provider, 'provider not defined');
      const tokenList: Awaited<ReturnType<typeof provider['getTokenList']>> =
        yield provider.getTokenList();

      this.tokenDetails.clear();
      this.tokens.length = 0;

      for (const item of tokenList) {
        try {
          const chainId = chainKeyToEndpointId(item.chainKey, 1);
          const {address} = item;
          const token = address
            ? Token.from({
                ...item,
                address,
                chainId,
              })
            : Coin.from({
                ...item,
                chainId,
              });

          this.tokens.push(token);
          this.tokenDetails.set(token.id, item);
        } catch (e) {
          console.error(e);
        }
      }
    }.bind(this),
  );
}

export const tokenStore = new TokenStore();
