import {Currency, CurrencyAmount, FiatAmount} from '@layerzerolabs/ui-core';
import {makeAutoObservable, ObservableMap} from 'mobx';

import {tokenStore} from './tokenStore';

export enum FiatSymbol {
  USD = 'USD',
  EUR = 'EUR',
}

export const DEFAULT_FIAT_SYMBOL = FiatSymbol.USD;

type CurrencyLike = {
  symbol: string;
};

export class FiatStore {
  protected tokenStore = tokenStore;
  protected symbols = new ObservableMap<string, string>();

  constructor() {
    makeAutoObservable(this, {}, {autoBind: true});
  }

  public getSymbol(currency: undefined): undefined;
  public getSymbol(currency: CurrencyLike): string;
  public getSymbol(currency: CurrencyLike | undefined): string | undefined;
  public getSymbol(currency: CurrencyLike | undefined) {
    if (!currency) return undefined;
    const symbol = currency.symbol;
    const override = this.symbols.get(symbol);
    return override || symbol;
  }

  public addSymbols(symbols: Record<string, string>) {
    for (const [key, value] of Object.entries(symbols)) {
      this.symbols.set(key, value);
    }
  }

  public getFiatPrice(
    currency: Currency,
    fiatSymbol = DEFAULT_FIAT_SYMBOL,
  ): FiatAmount | undefined {
    const details = this.tokenStore.getDetails(currency);
    const price = details?.price?.[fiatSymbol as 'USD'];
    if (!price) return undefined;
    return {
      value: price,
      currency: fiatSymbol,
    };
  }

  getFiatAmount(amount?: CurrencyAmount, fiatSymbol = DEFAULT_FIAT_SYMBOL): FiatAmount | undefined {
    if (amount) {
      if (amount.equalTo(0)) {
        return {value: 0, currency: fiatSymbol};
      }
      const price = this.getFiatPrice(amount.currency, fiatSymbol);
      if (!price) return undefined;
      const value = parseFloat(amount.toExact()) * price.value;
      return {
        value,
        currency: fiatSymbol,
      };
    }
    return undefined;
  }

  sum(
    amounts: Array<CurrencyAmount | undefined>,
    fiatSymbol = DEFAULT_FIAT_SYMBOL,
  ): FiatAmount | undefined {
    if (amounts) {
      let result = 0;
      for (let i = 0; i < amounts.length; i++) {
        const amount = this.getFiatAmount(amounts[i], fiatSymbol);
        if (!amount) {
          return undefined;
        }
        result += amount.value;
      }
      return {
        value: result,
        currency: fiatSymbol,
      };
    }
    return undefined;
  }
}

export const fiatStore = new FiatStore();
