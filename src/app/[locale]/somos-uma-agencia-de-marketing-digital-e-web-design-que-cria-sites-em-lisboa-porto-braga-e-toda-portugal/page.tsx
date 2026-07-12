import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { SiteGoogleLandingClient } from '@/components/lp-site-google/SiteGoogleLandingClient';
import { getGoogleReviews } from '@/components/lp-site-google/google-reviews';

export const dynamic = 'force-dynamic';

type Props = {
  params: Promise<{ locale: string }>;
};

const SLUG = 'somos-uma-agencia-de-marketing-digital-e-web-design-que-cria-sites-em-lisboa-porto-braga-e-toda-portugal';

// SEO on-page — title / meta description por idioma (padrão: PT-PT).
const metadataByLocale = {
  pt: {
    title: 'Agência de Marketing Digital e Web Design em Portugal | BlackElephant',
    description:
      'Agência de marketing digital e web design em Braga, Porto, Lisboa e toda Portugal. Criamos sites, landing pages, ecommerce e Google Ads que aparecem no Google e nas buscas de IA. Entrega em 14 dias.',
  },
  en: {
    title: 'Digital Marketing & Web Design Agency in Portugal | BlackElephant',
    description:
      'Digital marketing and web design agency in Braga, Porto, Lisbon and all of Portugal. We build websites, landing pages, ecommerce and Google Ads that rank on Google and AI search. Delivered in 14 days.',
  },
};

// TODO (Gui): criar a imagem de preview 1200x630 e guardá-la em
// public/og/site-que-aparece-no-google.png (é referenciada abaixo).
const OG_IMAGE = '/og/site-que-aparece-no-google.png';

function getMetadataCopy(locale: string) {
  return locale === 'en' ? metadataByLocale.en : metadataByLocale.pt;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const copy = getMetadataCopy(locale);
  const canonicalLocale = locale === 'en' ? 'en' : 'pt';

  return {
    title: copy.title,
    description: copy.description,
    openGraph: {
      title: copy.title,
      description: copy.description,
      type: 'website',
      siteName: 'BlackElephant',
      locale: locale === 'en' ? 'en_US' : 'pt_PT',
      images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: copy.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: copy.title,
      description: copy.description,
      images: [OG_IMAGE],
    },
    alternates: {
      canonical: `/${canonicalLocale}/${SLUG}`,
      languages: {
        'pt-PT': `/pt/${SLUG}`,
        en: `/en/${SLUG}`,
      },
    },
  };
}

export default async function SiteGoogleLandingPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  // Avaliações reais do perfil Google (Places API). Sem chave configurada
  // devolve null e o cliente usa os cartões de fallback.
  const googleReviews = await getGoogleReviews(locale);

  return <SiteGoogleLandingClient locale={locale} googleReviews={googleReviews} />;
}
