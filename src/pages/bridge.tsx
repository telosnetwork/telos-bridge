import {observer} from 'mobx-react';
import {useState} from 'react';

import {Bridge} from '@/bridge/ui/Bridge';
import {BridgeTracker} from '@/bridge/ui/BridgeTracker';
import {GasPrice} from '@/bridge/ui/GasPrice';
import {CustomHtmlHead} from '@/core/ui/CustomHtmlHead';
import {AppFooter, AppHeader, AppMenu} from '@/core/ui/Layout';
import {PageLayout} from '@/core/ui/PageLayout';
import {Panel} from '@/core/ui/Panel';

import {NextPageWithLayout} from '../../types/next';

const BridgePage: NextPageWithLayout = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false); // Save the value for isMenuOpen

  return (
    <>
      <Panel>
        <BridgeTracker sx={{mb: 4}} />
      </Panel>
      <Panel title='Bridge' endAdornment={<GasPrice />}>
        <Bridge />
      </Panel>
    </>
  );
};

BridgePage.getLayout = (page) => (
  <PageLayout
    centered
    header={<AppHeader />}
    footer={<AppFooter />}
    sidebar={<AppMenu />}
  >
    <CustomHtmlHead title='Telos Bridge'/>
    {page}
  </PageLayout>
);

export default observer(BridgePage);
