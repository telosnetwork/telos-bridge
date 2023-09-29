import {BalanceProvider, Currency, CurrencyAmount, getNetwork, Token} from '@layerzerolabs/ui-core';
import {flow, makeAutoObservable, ObservableMap} from 'mobx';

export class BalanceStore {
  balances = new ObservableMap<string, CurrencyAmount>();
  providers: BalanceProvider[] = [];

  constructor() {
    makeAutoObservable(this, {}, {autoBind: true});
  }

  getBalance(currency: Currency, account: string): CurrencyAmount | undefined {
    const key = currencyAccountKey(currency, account);
    return this.balances.get(key);
  }

  addProviders(providers: BalanceProvider[]) {
    this.providers.push(...providers);
  }

  updateBalance = flow(function* (this: BalanceStore, currency: Currency, account: string) {
    const key = currencyAccountKey(currency, account);
    for (const provider of this.providers) {
      if (provider.supports(currency)) {
        const newBalance = yield provider.getBalance(currency, account);
        const oldBalance = this.balances.get(key);
        // don't update balance if same value
        if (oldBalance?.equalTo(newBalance)) return oldBalance;
        this.balances.set(key, newBalance);
        // end
        return newBalance;
      }
    }
    throw new Error(`No provider for ${currency.symbol} on ${getNetwork(currency.chainId).name}`);
  });
}

const currencyKey = (c: Currency) =>
  [c.chainId, c.symbol, (c as Token).address ?? '0xNATIVE'].join(':');
const currencyAccountKey = (currency: Currency, account: string) =>
  currencyKey(currency) + ':' + account;

export const balanceStore = new BalanceStore();
