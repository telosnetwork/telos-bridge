import {Currency, CurrencyAmount, getScanLink, isAptosChainId} from '@layerzerolabs/ui-core';
import assert from 'assert';
import {autorun, flow, makeAutoObservable, ObservableMap} from 'mobx';
import {toast} from 'react-toastify';

import {fiatStore} from '@/core/stores/fiatStore';
import {uiStore, WalletTab} from '@/core/stores/uiStore';
import {walletStore} from '@/core/stores/walletStore';
import {Toast} from '@/core/ui/Toast';
import {handleError} from '@/core/utils/handleError';
import {parseWalletError} from '@/core/utils/parseWalletError';

import {bridgeStore} from './bridgeStore';

class UnclaimedBalance {
  amount: CurrencyAmount;
  address: string;
  constructor(args: {amount: CurrencyAmount; address: string}) {
    this.amount = args.amount;
    this.address = args.address;
    makeAutoObservable(this);
  }
}

class UnclaimedStore {
  public isExecuting = false;
  public isClaiming = false;
  public isMining = false;
  public isSigning = false;

  public claimingAmount: CurrencyAmount | undefined = undefined;

  protected balances = new ObservableMap<string, UnclaimedBalance>();

  constructor() {
    makeAutoObservable(this);
  }

  get currencies() {
    return bridgeStore.currencies;
  }

  get apis() {
    return bridgeStore.apis;
  }

  get unclaimed() {
    const wallets = walletStore.active;
    return wallets.flatMap((wallet) => this.getAllUnclaimed(wallet.address));
  }

  protected getBridgeApi(currency: Currency) {
    return this.apis.find((s) => s.supportsClaim(currency));
  }

  isUnclaimed(currency: Currency): boolean {
    for (const unclaimed of this.unclaimed) {
      if (unclaimed.amount.currency.equals(currency)) return true;
    }
    return false;
  }

  getUnclaimedBalance(currency: Currency, address: string): UnclaimedBalance | undefined {
    const key = toKey(currency, address);
    return this.balances.get(key);
  }

  getAllUnclaimed(address?: string): UnclaimedBalance[] {
    return Array.from(this.balances.values()).filter(
      (i) => i.address === address && i.amount.greaterThan(0),
    );
  }

  updateUnclaimedBalance = flow(
    function* (this: UnclaimedStore, currency: Currency, address: string) {
      const key = toKey(currency, address);
      const bridge = this.getBridgeApi(currency);
      assert(bridge);
      const amount: CurrencyAmount = yield bridge.getUnclaimed(currency, address);
      const balance = this.getUnclaimedBalance(currency, address);
      if (balance) {
        balance.amount = amount;
      } else {
        this.balances.set(key, new UnclaimedBalance({amount, address}));
      }
    }.bind(this),
  );

  claim = flow(function* (this: UnclaimedStore, currency: Currency) {
    const bridge = this.getBridgeApi(currency);
    assert(bridge);
    try {
      this.isExecuting = true;
      const wallet = walletStore.aptos;
      assert(wallet);

      const claimingAmount: Awaited<ReturnType<typeof bridge['getUnclaimed']>> =
        yield bridge.getUnclaimed(currency, wallet.address);
      this.claimingAmount = claimingAmount;
      this.isSigning = true;
      const unsignedTransaction: Awaited<ReturnType<typeof bridge['claim']>> = yield bridge.claim(
        currency,
      );
      const transactionResult: Awaited<
        ReturnType<typeof unsignedTransaction['signAndSubmitTransaction']>
      > = yield unsignedTransaction.signAndSubmitTransaction(wallet.signer);
      this.isSigning = false;
      this.isMining = true;
      const receipt = yield transactionResult.wait();
      this.isMining = false;
      this.isExecuting = false;

      yield this.updateUnclaimedBalance(currency, wallet.address);

      toast.success(
        <Toast>
          <h1>
            Claimed {claimingAmount?.toExact()} {fiatStore.getSymbol(currency)}
          </h1>
          <p>
            <a
              href={getScanLink(currency.chainId, receipt.txHash)}
              target='_blank'
              rel='noreferrer'
            >
              View on block explorer
            </a>
          </p>
        </Toast>,
      );
    } catch (e) {
      handleError(e, () => {
        const {title, message} = parseWalletError(e);

        toast.error(
          <Toast>
            <h1>{title}</h1>
            <p>{message}</p>
          </Toast>,
        );
      });
      throw e;
    } finally {
      this.isExecuting = false;
      this.isSigning = false;
      this.isMining = false;

      // todo: don't depend on uiStore
      closeUnclaimedTokensModal();
    }
  });
}

function closeUnclaimedTokensModal() {
  if (uiStore.walletModal.activeTab === WalletTab.UNCLAIMED) {
    uiStore.walletModal.setActiveTab(WalletTab.TRANSACTIONS);
    uiStore.walletModal.close();
  }
  uiStore.claimReminderAlert.close();
}

function toKey(currency: Currency, address: string) {
  return `${currency.symbol}:${address}`;
}

export const unclaimedStore = new UnclaimedStore();

export function initUnclaimedStore(unclaimedStore: UnclaimedStore) {
  function updateAptosBalance() {
    const wallet = walletStore.aptos;
    const currencies = unclaimedStore.currencies.filter((c) => isAptosChainId(c.chainId));
    const strategies = unclaimedStore.apis.slice();

    if (!wallet?.address) return;
    if (strategies.length == 0) return;
    for (const currency of currencies) {
      unclaimedStore.updateUnclaimedBalance(currency, wallet.address);
    }
  }

  const handlers = [
    //
    autorun(() => updateAptosBalance()),
  ];
  // unregister
  return () => {
    handlers.forEach((handler) => handler());
  };
}
