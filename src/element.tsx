import '../styles/style.css';
import 'react-toastify/dist/ReactToastify.css';

import {mainnet as aptos_mainnet} from '@layerzerolabs/ui-bridge-aptos';
import {createFailoverProviderFactory} from '@layerzerolabs/ui-evm';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {observer} from 'mobx-react';
import React, {useEffect} from 'react';
import {createRoot, Root} from 'react-dom/client';

import {bridgeStore} from '@/bridge/stores/bridgeStore';
import {AccountModal} from '@/bridge/ui/AccountModal';
import {Bridge} from '@/bridge/ui/Bridge';
import {BridgeTracker} from '@/bridge/ui/BridgeTracker';
import {GasOnDestinationModal} from '@/bridge/ui/GasOnDestinationModal';
import {JsonRpcProviderContext} from '@/core/context/JsonRpcProviderContext';
import {tokenStore} from '@/core/stores/tokenStore';
import {transactionStore} from '@/core/stores/transactionStore';
import {uiStore} from '@/core/stores/uiStore';
import {walletStore} from '@/core/stores/walletStore';
import {createBasicTheme} from '@/core/theme';
import {GlobalStyles, Theme, ThemeProvider} from '@/core/ui/system';
import {ToastProvider} from '@/core/ui/Toast';
import {createMulticallProviderFactory} from '@/core/utils/multicall';

import {bootstrap} from './bootstrap';

const failoverProvider = createFailoverProviderFactory();
const multicallProvider = createMulticallProviderFactory(failoverProvider);

class LzTrackerElement extends HTMLElement {
  private root: Root | undefined;

  connectedCallback() {
    this.root = createRoot(this);
    this.render();
  }

  private render() {
    if (this.root) {
      this.root.render(
        <TrackerLayout>
          <BridgeTracker />
        </TrackerLayout>,
      );
    }
  }
}

class LzBridgeElement extends HTMLElement {
  private static initialized = false;
  private root: Root = null!;

  connectedCallback() {
    this.root = createRoot(this);
    this.render();
  }

  private render() {
    this.root.render(
      <BridgeLayout>
        <Bridge />
      </BridgeLayout>,
    );
  }

  static bootstrap = (config?: {
    stargate?: {
      partner?: {
        feeCollector?: string | null;
        feeBps?: number | null;
        partnerId: number;
      };
    };
  }) => {
    if (this.initialized) throw new Error('App already initialized');
    this.initialized = true;

    bootstrap(
      {
        bridge: {
          gasDrop: [],
          aptos: [aptos_mainnet],
          onft: [],
          stargate: {
            partner: config?.stargate?.partner,
          },
          oft: [],
          wrappedToken: [],
        },
      },
      multicallProvider,
    );
  };

  static uiStore = uiStore;
  static bridgeStore = bridgeStore;
  static walletStore = walletStore;
  static transactionStore = transactionStore;

  static createBasicTheme = createBasicTheme;
}

const queryClient = new QueryClient();

const TrackerLayout: React.FC<React.PropsWithChildren> = observer(({children}) => {
  const {theme} = uiStore;
  return <ThemeProvider theme={theme.value}>{children}</ThemeProvider>;
});

const BridgeLayout: React.FC<React.PropsWithChildren> = observer(({children}) => {
  const {walletModal, theme} = uiStore;

  useEffect(() => {
    tokenStore.updateTokens();
  }, []);

  return (
    <JsonRpcProviderContext.Provider value={multicallProvider}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme.value}>
          <ToastProvider>
            <GlobalStyles
              styles={(theme: Theme) => ({
                body: {
                  backgroundColor: theme.palette.background.default,
                  fontFamily: theme.typography.fontFamily,
                },
              })}
            />
            {children}
            <GasOnDestinationModal
              open={uiStore.dstNativeAmountModal.value}
              onClose={uiStore.dstNativeAmountModal.close}
            />
            <AccountModal open={walletModal.value} onClose={walletModal.close} />
          </ToastProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </JsonRpcProviderContext.Provider>
  );
});

customElements.define('lz-bridge', LzBridgeElement);
customElements.define('lz-tracker', LzTrackerElement);
