import { setRequestLocale } from 'next-intl/server'
import { getCurrentUser } from '@/lib/supabase/queries/users'

export const dynamic = 'force-dynamic'

type Params = Promise<{ locale: string }>

export default async function CustomerDashboardPage({ params }: { params: Params }) {
  const { locale } = await params
  setRequestLocale(locale)
  const user = await getCurrentUser()

  return (
    <div className="flex flex-col gap-2 py-12">
      <p className="text-2xl font-semibold" style={{ color: 'var(--foreground)' }}>
        Olá, <span style={{ color: 'var(--primary)' }}>{user?.name}</span>. Você está no sistema de{' '}
        <strong>cliente</strong>.
      </p>
      <p className="mt-6 text-base italic" style={{ color: 'var(--foreground-muted)' }}>
        Sistema em construção.
      </p>
    </div>
  )
}
