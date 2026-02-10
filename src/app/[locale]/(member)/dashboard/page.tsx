import { useTranslations } from 'next-intl'
import { setRequestLocale } from 'next-intl/server'

type Params = Promise<{ locale: string }>

export default async function DashboardPage({ params }: { params: Params }) {
  const { locale } = await params
  setRequestLocale(locale)
  
  return <DashboardContent />
}

function DashboardContent() {
  const t = useTranslations('member')

  return (
    <div>
      <h1 className="text-3xl font-bold">{t('dashboard')}</h1>
      <p className="mt-2" style={{ color: 'var(--foreground-muted)' }}>
        Bem-vindo à área de membros.
      </p>
    </div>
  )
}
