import { redirect } from 'next/navigation'
import { setRequestLocale } from 'next-intl/server'
import { getCurrentUser } from '@/lib/supabase/queries/users'

type Params = Promise<{ locale: string }>

export default async function DashboardPage({ params }: { params: Params }) {
  const { locale } = await params
  setRequestLocale(locale)

  const user = await getCurrentUser()

  if (!user) {
    redirect(`/${locale}/login`)
  }

  if (user.role === 'admin') {
    redirect(`/${locale}/dashboard/admin`)
  } else {
    redirect(`/${locale}/dashboard/customer`)
  }
}
