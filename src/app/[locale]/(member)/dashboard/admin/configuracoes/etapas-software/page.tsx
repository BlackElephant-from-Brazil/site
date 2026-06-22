import { setRequestLocale } from 'next-intl/server'
import {
  getProjectStages,
  createProjectStage,
  updateProjectStage,
  reorderProjectStages,
  deleteProjectStage,
} from '@/lib/actions/project-stages'
import { KanbanColumnsConfigView } from '@/components/admin/views/KanbanColumnsConfigView'

export const dynamic = 'force-dynamic'

type Params = Promise<{ locale: string }>

export default async function EtapasSoftwarePage({ params }: { params: Params }) {
  const { locale } = await params
  setRequestLocale(locale)
  const stages = await getProjectStages()
  return (
    <KanbanColumnsConfigView
      title="Etapas do Projeto - Software"
      subtitle="Configure as etapas dos projetos de software"
      initialColumns={stages}
      createColumn={createProjectStage}
      updateColumn={updateProjectStage}
      reorderColumns={reorderProjectStages}
      deleteColumn={deleteProjectStage}
    />
  )
}
