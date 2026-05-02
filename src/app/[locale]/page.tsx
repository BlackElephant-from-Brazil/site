import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { HomeClient } from '@/components/features/HomeClient';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'home' });
  
  return {
    title: t('meta.title'),
    description: t('meta.description'),
    keywords: t('meta.keywords'),
    openGraph: {
      title: t('meta.title'),
      description: t('meta.description'),
      type: 'website',
      siteName: 'BlackElephant',
      locale: locale === 'pt' ? 'pt_BR' : locale,
    },
    twitter: {
      card: 'summary_large_image',
      title: t('meta.title'),
      description: t('meta.description'),
    },
    alternates: {
      canonical: '/',
      languages: {
        'pt-BR': '/pt',
        'en': '/en',
        'es': '/es',
        'de': '/de',
        'fr': '/fr',
        'it': '/it',
      },
    },
  };
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <HomeClient locale={locale} />
  );
}
