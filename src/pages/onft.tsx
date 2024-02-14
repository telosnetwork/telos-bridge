import {observer} from 'mobx-react';

import {CustomHtmlHead} from '@/core/ui/CustomHtmlHead';
import {AppFooter, AppHeader} from '@/core/ui/Layout';
import {PageLayout} from '@/core/ui/PageLayout';
import {useOnftMetadataProviders} from '@/onft/hooks/useOnftMetadataProviders';
import {OnftMetadataProvidersContext} from '@/onft/providers/OnftMetadataProvidersContext';
import {OnftBridge} from '@/onft/ui/OnftBridge';

import {NextPageWithLayout} from '../../types/next';

const OnftPage: NextPageWithLayout = () => {
  const onftMetadataProviders = useOnftMetadataProviders();
  return (
    <OnftMetadataProvidersContext.Provider value={onftMetadataProviders}>
      <OnftBridge />
    </OnftMetadataProvidersContext.Provider>
  );
};

OnftPage.getLayout = (page) => (
  <PageLayout centered header={<AppHeader />} footer={<AppFooter />}>
    <CustomHtmlHead title='ONFT Bridge' />
    {page}
  </PageLayout>
);

export default observer(OnftPage);
