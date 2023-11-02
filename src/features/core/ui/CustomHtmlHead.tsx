import Head from 'next/head';

import {useTheme} from '@/core/ui/system';

interface CustomHtmlHeadProps {
  description?: string;
  title?: string;
  url?: string;
}


const defaultDescription = 'The LayerZero Telos bridge enables seamless asset transfers between Telos and other blockchains. Connect your source and destination wallets to facilitate the seamless transfer of assets between Telos and external ecosystems, alleviating the risk of wrapped asset bridges.';
const keywords = 'telos, tlos, blockchain, crypto, message, transaction, omnichain, bridge';

export const CustomHtmlHead = (props: CustomHtmlHeadProps) => {
  const {description = defaultDescription, url} = props;
  const metaTitle = 'Telos Bridge';
  const theme = useTheme();
  return (
    <Head>
      <title>{metaTitle}</title>
      <meta name='description' content={description} />
      {url && <link rel='canonical' href={url} />}

      <meta name='og:title' content={metaTitle} />
      {url && <meta name='og:url' content={url} />}
      <meta name='og:site_name' content={metaTitle} />
      <meta name='og:description' content={description} />
      <meta name='og:type' content='site' />

      <meta charSet='utf-8' />
      <meta name='language' content='english' />
      <meta httpEquiv='content-type' content='text/html' />
      <meta name='author' content={'Telos'} />
      <meta name='designer' content={'Telos'} />
      <meta name='publisher' content={'Telos'} />
      <meta name='keywords' content={keywords} />
      <meta name='distribution' content='web' />
      <link rel='apple-touch-icon' href='/apple-touch-icon.png' />
      <link rel='apple-touch-icon' sizes='16x16' href='/favicon-16x16.png' />
      <link rel='apple-touch-icon' sizes='32x32' href='/favicon-32x32.png' />
      <link rel='apple-touch-icon' sizes='180x180' href='/apple-touch-icon.png' />
      <link rel='icon' type='image/png' sizes='32x32' href='/favicon-32x32.png' />
      <link rel='icon' type='image/png' sizes='16x16' href='/favicon-16x16.png' />
      <link rel='shortcut icon' href='/favicon.ico' />
      {/* <meta name='og:image' content={'/share.png'} />
      <link rel='mask-icon' color='#000000' href='/safari-pinned-tab.svg' />
      <link rel='manifest' href='/site.webmanifest' /> */}
      <meta name='msapplication-TileColor' content={theme.palette.primary.main ?? '#000000'} />
      <meta name='theme-color' content={theme.palette.primary.main ?? '#000000'} />
      <meta name='viewport' content='width=device-width, minimum-scale=1, initial-scale=1.0' />
      <meta name='twitter:card' content='summary' />
      <meta name='twitter:site' content='@HelloTelos' />
    </Head>
  );
};
