import { setRequestLocale } from 'next-intl/server'
import { getClients } from '@/lib/actions/clients'
import { ClientsView } from '@/components/admin/views/ClientsView'

type Params = Promise<{ locale: string }>

export default async function ClientesPage({ params }: { params: Params }) {
  const { locale } = await params
  setRequestLocale(locale)
  const clients = await getClients()
  return <ClientsView initialClients={clients} />
}
