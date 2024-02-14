import {observer} from 'mobx-react';

import {OFTBridge} from '@/bridge/ui/OFTBridge';
import {CustomHtmlHead} from '@/core/ui/CustomHtmlHead';
import {AppFooter, AppHeader} from '@/core/ui/Layout';
import {PageLayout} from '@/core/ui/PageLayout';

import {NextPageWithLayout} from '../../types/next';

const OftPage: NextPageWithLayout = () => {
  return <OFTBridge />;
};

OftPage.getLayout = (page) => (
  <PageLayout centered header={<AppHeader />} footer={<AppFooter />}>
    <CustomHtmlHead title='OFT Bridge' />
    {page}
  </PageLayout>
);

export default observer(OftPage);
