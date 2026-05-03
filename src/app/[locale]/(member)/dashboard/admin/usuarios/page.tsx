import { setRequestLocale } from 'next-intl/server'
import { getUsers } from '@/lib/actions/users'
import { UsersView } from '@/components/admin/views/UsersView'

export const dynamic = 'force-dynamic'

type Params = Promise<{ locale: string }>

export default async function UsuariosPage({ params }: { params: Params }) {
  const { locale } = await params
  setRequestLocale(locale)
  const users = await getUsers()
  return <UsersView initialUsers={users} />
}
