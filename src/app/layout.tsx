import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'HUBFIVE | Soluções digitais sob medida',
  description:
    'HUBFIVE acelera produtos digitais com estratégia, design e engenharia sob medida para negócios que querem crescer com tecnologia.',
  keywords: ['HUBFIVE', 'software sob medida', 'produtos digitais', 'tecnologia', 'consultoria'],
  openGraph: {
    title: 'HUBFIVE | Soluções digitais sob medida',
    description:
      'Acelere inovação com squads multidisciplinares, UX, engenharia e dados. Portfólio, depoimentos e pacotes para cada jornada.',
    url: 'https://hubfive.example.com',
    siteName: 'HUBFIVE',
    images: [{ url: 'https://hubfive.example.com/og-image.png', width: 1200, height: 630, alt: 'HUBFIVE design system' }]
  },
  metadataBase: new URL('https://hubfive.example.com'),
  alternates: { canonical: '/' },
  twitter: {
    card: 'summary_large_image',
    title: 'HUBFIVE | Experiências digitais inteligentes',
    description: 'Produtos digitais end-to-end com foco em resultado.',
    images: ['https://hubfive.example.com/og-image.png']
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <meta name="theme-color" content="#0A0A0A" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
