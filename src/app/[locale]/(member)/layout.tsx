import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/supabase/queries/users'

type Params = Promise<{ locale: string }>

export default async function MemberLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Params
}) {
  const { locale } = await params
  const user = await getCurrentUser()
  if (!user) redirect(`/${locale}/login`)
  return <>{children}</>
}
