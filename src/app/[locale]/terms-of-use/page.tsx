import { setRequestLocale } from 'next-intl/server'
import type { Metadata } from 'next'
import { Link } from '@/i18n/navigation'

type Params = Promise<{ locale: string }>

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale } = await params
  const titles: Record<string, string> = {
    pt: 'Termos de Uso | BlackElephant',
    en: 'Terms of Use | BlackElephant',
    es: 'Términos de Uso | BlackElephant',
    de: 'Nutzungsbedingungen | BlackElephant',
    fr: "Conditions d'Utilisation | BlackElephant",
    it: 'Termini di Utilizzo | BlackElephant',
  }
  return {
    title: titles[locale] ?? titles.pt,
    robots: { index: false, follow: false },
  }
}

export default async function TermsOfUsePage({ params }: { params: Params }) {
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
          className="absolute -right-32 top-0 h-[600px] w-[600px] rounded-full blur-[200px]"
          style={{ backgroundColor: 'var(--color-lime)', opacity: 0.04 }}
        />
      </div>

      <div className="site-container relative z-10 max-w-3xl">
        {/* Breadcrumb */}
        <div className="mb-8 flex items-center gap-2 text-xs" style={{ color: 'var(--foreground-muted)' }}>
          <Link href="/" className="hover:text-[var(--color-lime)] transition-colors">Início</Link>
          <span>/</span>
          <span>Termos de Uso</span>
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
          Termos de Uso
        </h1>
        <p className="mb-10 text-sm" style={{ color: 'var(--foreground-muted)' }}>
          Última atualização: junho de 2025
        </p>

        <div className="space-y-10 text-sm leading-[1.8]" style={{ color: 'var(--foreground-muted)' }}>

          <Section title="1. Aceitação dos Termos">
            <p>
              Ao acessar ou utilizar o site <strong className="text-white">blackelephant.com.br</strong> e os serviços da{' '}
              <strong className="text-white">BlackElephant Tecnologia</strong>, você concorda com estes Termos de Uso. Caso
              não concorde com alguma cláusula, pedimos que não utilize o site.
            </p>
          </Section>

          <Section title="2. Sobre a BlackElephant">
            <p>
              A BlackElephant Tecnologia é uma empresa especializada em desenvolvimento de software, criação de sites,
              aplicativos, sistemas web e automações digitais. Atuamos como prestadora de serviços para empresas e
              empreendedores que desejam transformar seus processos com tecnologia.
            </p>
          </Section>

          <Section title="3. Uso do Site">
            <p>Ao utilizar este site, você se compromete a:</p>
            <ul className="mt-3 space-y-2 pl-4">
              <Li>Fornecer informações verdadeiras nos formulários de contato e orçamento;</Li>
              <Li>Não utilizar o site para fins ilegais, fraudulentos ou que prejudiquem terceiros;</Li>
              <Li>Não tentar obter acesso não autorizado a sistemas, dados ou áreas restritas;</Li>
              <Li>Não reproduzir, copiar ou distribuir conteúdos do site sem autorização prévia por escrito.</Li>
            </ul>
          </Section>

          <Section title="4. Serviços Contratados">
            <p>
              Os serviços disponibilizados pela BlackElephant — incluindo, mas não se limitando a, criação de landing
              pages, desenvolvimento de sistemas e automações — são regidos por contratos ou propostas comerciais
              específicos aceitos por ambas as partes. Estes Termos de Uso complementam, mas não substituem, os acordos
              contratuais firmados entre a BlackElephant e seus clientes.
            </p>
            <p className="mt-3">
              Prazos, condições de pagamento, garantias e escopo de entrega são definidos em cada proposta comercial
              individual.
            </p>
          </Section>

          <Section title="5. Propriedade Intelectual">
            <p>
              Todo o conteúdo do site — textos, imagens, logotipos, vídeos, código-fonte e design — é propriedade
              exclusiva da BlackElephant Tecnologia ou de seus parceiros licenciados, e está protegido pela legislação
              de propriedade intelectual brasileira (Lei nº 9.610/1998 e Lei nº 9.279/1996).
            </p>
            <p className="mt-3">
              É proibida a reprodução, distribuição ou criação de obras derivadas sem autorização prévia e expressa da
              BlackElephant.
            </p>
          </Section>

          <Section title="6. Limitação de Responsabilidade">
            <p>
              A BlackElephant emprega boas práticas para manter o site disponível e seguro, mas não garante a ausência
              de interrupções, erros ou falhas técnicas. Em nenhuma hipótese a BlackElephant será responsável por danos
              indiretos, lucros cessantes ou perdas consequentes decorrentes do uso ou incapacidade de uso deste site.
            </p>
            <p className="mt-3">
              Links para sites de terceiros presentes neste site não implicam endosso ou responsabilidade da BlackElephant
              sobre o conteúdo dessas páginas.
            </p>
          </Section>

          <Section title="7. Privacidade">
            <p>
              O uso dos seus dados pessoais é regido pela nossa{' '}
              <Link
                href="/privacy-policy"
                className="font-semibold transition-colors hover:text-[var(--color-lime)]"
                style={{ color: 'var(--foreground)' }}
              >
                Política de Privacidade
              </Link>
              , que faz parte integrante destes Termos de Uso.
            </p>
          </Section>

          <Section title="8. Modificações">
            <p>
              A BlackElephant reserva-se o direito de alterar estes Termos de Uso a qualquer momento. As alterações
              entram em vigor imediatamente após a publicação nesta página. O uso continuado do site após a publicação
              de alterações constitui aceitação dos novos termos.
            </p>
          </Section>

          <Section title="9. Lei Aplicável e Foro">
            <p>
              Estes Termos de Uso são regidos pelas leis da República Federativa do Brasil. Fica eleito o foro da
              comarca de <strong className="text-white">Santana de Parnaíba, SP</strong>, para dirimir quaisquer
              conflitos decorrentes deste instrumento, com renúncia a qualquer outro, por mais privilegiado que seja.
            </p>
          </Section>

          <Section title="10. Contato">
            <p>
              Em caso de dúvidas sobre estes Termos de Uso, entre em contato:
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
