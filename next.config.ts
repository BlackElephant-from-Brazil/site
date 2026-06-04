import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  async redirects() {
    return [
      {
        source: '/:locale/sites-landing-pages',
        destination: '/:locale/venda-mais-com-uma-landing-page-de-alta-conversao',
        permanent: true,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
