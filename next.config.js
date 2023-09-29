const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: '/',
        destination: '/bridge',
        permanent: false,
      },
    ];
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/i,
      issuer: /\.[jt]sx?$/,
      use: [
        {
          loader: '@svgr/webpack',
          options: {
            titleProp: true,
            ext: 'tsx',
            icon: false,
            typescript: false,
            ref: true,
            memo: true,
            replaceAttrValues: {color: 'currentColor'},
            svgProps: {},
          },
        },
      ],
    });
    return config;
  },
};

module.exports = nextConfig;
