import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/supabase/queries/users'
import { AdminSidebar } from '@/components/admin/AdminSidebar'

type Params = Promise<{ locale: string }>

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Params
}) {
  const { locale } = await params
  const user = await getCurrentUser()

  if (!user) redirect(`/${locale}/login`)
  if (user.role !== 'admin') redirect(`/${locale}/dashboard/customer`)

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--background)' }}>
      <AdminSidebar user={user} />
      <main className="flex-1 overflow-y-auto px-8 py-8">{children}</main>
    </div>
  )
}
