import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { SitesLandingPagesClient } from '@/components/sites-landing-pages/SitesLandingPagesClient';

type Props = {
  params: Promise<{ locale: string }>;
};

const metadataByLocale = {
  pt: {
    title: 'Landing Pages e Sites que Vendem | BlackElephant',
    description:
      'Landing pages de alta conversao e sites multipagina premium para transformar trafego pago em leads, WhatsApp e vendas.',
  },
  en: {
    title: 'Landing Pages and Websites That Sell | BlackElephant',
    description:
      'High-converting landing pages and premium multipage websites built to turn paid traffic into leads, WhatsApp conversations, and sales.',
  },
};

function getMetadataCopy(locale: string) {
  return locale === 'pt' ? metadataByLocale.pt : metadataByLocale.en;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const copy = getMetadataCopy(locale);
  const canonicalLocale = locale === 'pt' ? 'pt' : 'en';

  return {
    title: copy.title,
    description: copy.description,
    openGraph: {
      title: copy.title,
      description: copy.description,
      type: 'website',
      siteName: 'BlackElephant',
      locale: locale === 'pt' ? 'pt_BR' : 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title: copy.title,
      description: copy.description,
    },
    alternates: {
      canonical: `/${canonicalLocale}/venda-mais-com-uma-landing-page-de-alta-conversao`,
      languages: {
        'pt-BR': '/pt/venda-mais-com-uma-landing-page-de-alta-conversao',
        en: '/en/venda-mais-com-uma-landing-page-de-alta-conversao',
      },
    },
  };
}

export default async function SitesLandingPagesPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <SitesLandingPagesClient locale={locale} />;
}
