import Head from 'next/head';
import { AboutSection } from '@/components/sections/AboutSection';
import { BenefitsSection } from '@/components/sections/BenefitsSection';
import { CustomSoftwareForm } from '@/components/sections/CustomSoftwareForm';
import { EcosystemSection } from '@/components/sections/EcosystemSection';
import { Hero } from '@/components/sections/Hero';
import { PackagesSection } from '@/components/sections/PackagesSection';
import { PortfolioCarousel } from '@/components/sections/PortfolioCarousel';
import { TestimonialsCarousel } from '@/components/sections/TestimonialsCarousel';
import { Footer } from '@/components/common/Footer';

export default function HomePage() {
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'HUBFIVE',
    url: 'https://hubfive.example.com',
    logo: 'https://hubfive.example.com/logo.png',
    sameAs: ['https://www.linkedin.com/company/hubfive'],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'sales',
      email: 'contato@hubfive.com',
      telephone: '+55-11-99999-0000',
      areaServed: 'BR'
    }
  };

  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'Squad HUBFIVE',
    description: 'Squads de produto digital com discovery, UX e engenharia.',
    brand: 'HUBFIVE',
    offers: {
      '@type': 'Offer',
      priceCurrency: 'BRL',
      price: '120000',
      availability: 'https://schema.org/InStock'
    }
  };

  const reviewSchema = {
    '@context': 'https://schema.org',
    '@type': 'Review',
    itemReviewed: {
      '@type': 'Service',
      name: 'Software sob medida'
    },
    reviewRating: {
      '@type': 'Rating',
      ratingValue: '5',
      bestRating: '5'
    },
    author: {
      '@type': 'Person',
      name: 'Clientes HUBFIVE'
    }
  };

  return (
    <>
      <Head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(reviewSchema) }} />
      </Head>
      <main>
        <Hero />
        <PortfolioCarousel />
        <TestimonialsCarousel />
        <AboutSection />
        <PackagesSection />
        <BenefitsSection />
        <EcosystemSection />
        <CustomSoftwareForm />
      </main>
      <Footer />
    </>
  );
}
