import { setRequestLocale } from 'next-intl/server'
import { getProjectTypes } from '@/lib/actions/project-types'

export const dynamic = 'force-dynamic'
import { ProjectTypesView } from '@/components/admin/views/ProjectTypesView'

type Params = Promise<{ locale: string }>

export default async function TiposProjetoPage({ params }: { params: Params }) {
  const { locale } = await params
  setRequestLocale(locale)
  const types = await getProjectTypes()
  return <ProjectTypesView initialTypes={types} />
}
