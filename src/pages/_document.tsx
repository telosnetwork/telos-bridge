import {Head, Html, Main, NextScript} from 'next/document';

const AppDocument = () => {
  return (
    <Html lang='en'>
      <Head>
        <link rel='preconnect' href='https://fonts.gstatic.com' crossOrigin='anonymous' />
        <link
          href='https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@400;500;600;700;800&display=swap'
          rel='stylesheet'
        />
        <script src="https://cdn.usefathom.com/script.js" data-site="EGITFGVM" defer></script>
      </Head>

      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
};

export default AppDocument;
