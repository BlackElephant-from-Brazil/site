import { setRequestLocale } from 'next-intl/server'
import type { Metadata } from 'next'
import { Link } from '@/i18n/navigation'

type Params = Promise<{ locale: string }>

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale } = await params
  const titles: Record<string, string> = {
    pt: 'Política de Privacidade | BlackElephant',
    en: 'Privacy Policy | BlackElephant',
    es: 'Política de Privacidad | BlackElephant',
    de: 'Datenschutzerklärung | BlackElephant',
    fr: 'Politique de Confidentialité | BlackElephant',
    it: 'Informativa sulla Privacy | BlackElephant',
  }
  return {
    title: titles[locale] ?? titles.pt,
    robots: { index: false, follow: false },
  }
}

export default async function PrivacyPolicyPage({ params }: { params: Params }) {
  const { locale } = await params
  setRequestLocale(locale)
  return (
    <main
      className="min-h-screen pt-20 pb-24"
      style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)' }}
    >
      {/* Background orb */}
      <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
        <div
          className="absolute -left-32 top-0 h-[600px] w-[600px] rounded-full blur-[200px]"
          style={{ backgroundColor: 'var(--color-lime)', opacity: 0.04 }}
        />
      </div>

      <div className="site-container relative z-10 max-w-3xl">
        {/* Breadcrumb */}
        <div className="mb-8 flex items-center gap-2 text-xs" style={{ color: 'var(--foreground-muted)' }}>
          <Link href="/" className="hover:text-[var(--color-lime)] transition-colors">Início</Link>
          <span>/</span>
          <span>Política de Privacidade</span>
        </div>

        {/* Badge */}
        <div
          className="mb-6 inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-[10px] font-medium uppercase tracking-[0.18em]"
          style={{
            borderColor: 'color-mix(in srgb, var(--color-lime) 20%, transparent)',
            color: 'color-mix(in srgb, var(--color-lime) 75%, transparent)',
            backgroundColor: 'color-mix(in srgb, var(--color-lime) 5%, transparent)',
          }}
        >
          Legal
        </div>

        <h1
          className="mb-3 text-3xl font-black sm:text-4xl lg:text-5xl"
          style={{ fontFamily: 'var(--font-title)' }}
        >
          Política de Privacidade
        </h1>
        <p className="mb-10 text-sm" style={{ color: 'var(--foreground-muted)' }}>
          Última atualização: junho de 2025
        </p>

        <div className="space-y-10 text-sm leading-[1.8]" style={{ color: 'var(--foreground-muted)' }}>

          <Section title="1. Quem Somos">
            <p>
              A <strong className="text-white">BlackElephant Tecnologia</strong> é uma empresa de desenvolvimento de
              software e automação digital com sede em Santana de Parnaíba, SP, Brasil. Esta Política de Privacidade
              descreve como coletamos, usamos e protegemos as informações dos visitantes e clientes do nosso site
              <strong className="text-white"> blackelephant.com.br</strong>.
            </p>
          </Section>

          <Section title="2. Dados que Coletamos">
            <p>Podemos coletar as seguintes categorias de dados:</p>
            <ul className="mt-3 space-y-2 pl-4">
              <Li><strong className="text-white">Dados de contato:</strong> nome, e-mail, telefone e empresa, fornecidos voluntariamente via formulários de contato ou orçamento.</Li>
              <Li><strong className="text-white">Dados de navegação:</strong> endereço IP, tipo de navegador, páginas visitadas, tempo de sessão e origem do acesso, coletados automaticamente por cookies e ferramentas de análise.</Li>
              <Li><strong className="text-white">Dados de conversão:</strong> interações com botões de WhatsApp e formulários, para medir o desempenho das campanhas de marketing.</Li>
            </ul>
          </Section>

          <Section title="3. Como Usamos os Dados">
            <p>Os dados coletados são utilizados para:</p>
            <ul className="mt-3 space-y-2 pl-4">
              <Li>Responder solicitações de contato, orçamento e suporte;</Li>
              <Li>Enviar comunicações sobre nossos serviços, quando autorizado;</Li>
              <Li>Analisar e melhorar o desempenho do site e das campanhas;</Li>
              <Li>Cumprir obrigações legais e contratuais.</Li>
            </ul>
            <p className="mt-3">
              Não vendemos, alugamos nem compartilhamos seus dados pessoais com terceiros para fins comerciais próprios.
            </p>
          </Section>

          <Section title="4. Compartilhamento de Dados">
            <p>
              Podemos compartilhar dados com prestadores de serviço que nos auxiliam na operação do site e das campanhas,
              incluindo plataformas de análise (Google Analytics / Google Ads), ferramentas de automação de marketing e
              provedores de hospedagem. Esses parceiros atuam como operadores de dados e são contratualmente obrigados a
              proteger as informações e usá-las apenas para as finalidades acordadas.
            </p>
          </Section>

          <Section title="5. Seus Direitos (LGPD)">
            <p>
              Nos termos da Lei Geral de Proteção de Dados (Lei nº 13.709/2018), você tem direito a:
            </p>
            <ul className="mt-3 space-y-2 pl-4">
              <Li>Confirmar a existência de tratamento dos seus dados;</Li>
              <Li>Acessar, corrigir ou atualizar seus dados;</Li>
              <Li>Solicitar a anonimização, bloqueio ou eliminação de dados desnecessários;</Li>
              <Li>Revogar o consentimento a qualquer momento;</Li>
              <Li>Solicitar a portabilidade dos dados;</Li>
              <Li>Obter informações sobre com quem compartilhamos seus dados.</Li>
            </ul>
            <p className="mt-3">
              Para exercer qualquer desses direitos, entre em contato pelo e-mail{' '}
              <a
                href="mailto:guilherme@blackelephant.com.br"
                className="transition-colors hover:text-[var(--color-lime)]"
                style={{ color: 'var(--foreground)' }}
              >
                guilherme@blackelephant.com.br
              </a>.
            </p>
          </Section>

          <Section title="6. Cookies">
            <p>
              Utilizamos cookies e tecnologias semelhantes para melhorar a experiência de navegação, analisar tráfego e
              medir o desempenho de campanhas publicitárias. Ao continuar navegando no site, você concorda com o uso de
              cookies conforme esta política.
            </p>
            <p className="mt-3">
              Você pode desativar cookies nas configurações do seu navegador. Isso pode afetar a funcionalidade de algumas
              partes do site.
            </p>
          </Section>

          <Section title="7. Retenção de Dados">
            <p>
              Mantemos seus dados pessoais pelo tempo necessário para cumprir as finalidades descritas nesta política ou
              conforme exigido por lei. Dados de contato fornecidos via formulário são retidos enquanto o relacionamento
              comercial for ativo ou por até 5 anos após o último contato.
            </p>
          </Section>

          <Section title="8. Segurança">
            <p>
              Adotamos medidas técnicas e organizacionais adequadas para proteger seus dados contra acesso não autorizado,
              perda, alteração ou divulgação. O acesso a dados pessoais é restrito a colaboradores e parceiros que
              necessitam das informações para realizar suas funções.
            </p>
          </Section>

          <Section title="9. Alterações nesta Política">
            <p>
              Podemos atualizar esta Política de Privacidade periodicamente. A versão mais recente estará sempre disponível
              nesta página, com a data de última atualização indicada no topo.
            </p>
          </Section>

          <Section title="10. Contato">
            <p>
              Em caso de dúvidas sobre esta política ou sobre o tratamento dos seus dados, entre em contato:
            </p>
            <div
              className="mt-4 rounded-xl border p-5"
              style={{
                backgroundColor: 'var(--glass-background)',
                borderColor: 'var(--glass-border)',
              }}
            >
              <p className="font-semibold text-white">BlackElephant Tecnologia</p>
              <p className="mt-1">Santana de Parnaíba, SP — Brasil</p>
              <p className="mt-1">
                <a
                  href="mailto:guilherme@blackelephant.com.br"
                  className="transition-colors hover:text-[var(--color-lime)]"
                  style={{ color: 'var(--foreground)' }}
                >
                  guilherme@blackelephant.com.br
                </a>
              </p>
            </div>
          </Section>
        </div>
      </div>
    </main>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2
        className="mb-4 text-base font-black text-white sm:text-lg"
        style={{ fontFamily: 'var(--font-title)' }}
      >
        {title}
      </h2>
      {children}
    </section>
  )
}

function Li({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-2">
      <span className="mt-2 h-1 w-1 shrink-0 rounded-full" style={{ backgroundColor: 'var(--color-lime)' }} />
      <span>{children}</span>
    </li>
  )
}
