import { setRequestLocale } from 'next-intl/server'
import { getProjects } from '@/lib/actions/projects'

export const dynamic = 'force-dynamic'
import { getClients } from '@/lib/actions/clients'
import { getProjectTypes } from '@/lib/actions/project-types'
import { ProjectsView } from '@/components/admin/views/ProjectsView'

type Params = Promise<{ locale: string }>

export default async function ProjetosPage({ params }: { params: Params }) {
  const { locale } = await params
  setRequestLocale(locale)
  const [projects, clients, projectTypes] = await Promise.all([
    getProjects(),
    getClients(),
    getProjectTypes(),
  ])
  return <ProjectsView initialProjects={projects} clients={clients} projectTypes={projectTypes} />
}
