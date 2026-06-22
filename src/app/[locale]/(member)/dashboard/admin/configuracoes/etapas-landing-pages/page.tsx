import { setRequestLocale } from 'next-intl/server'
import {
  getLandingPagesProjectStages,
  createLandingPagesProjectStage,
  updateLandingPagesProjectStage,
  reorderLandingPagesProjectStages,
  deleteLandingPagesProjectStage,
} from '@/lib/actions/landing-pages-project-stages'
import { KanbanColumnsConfigView } from '@/components/admin/views/KanbanColumnsConfigView'

export const dynamic = 'force-dynamic'

type Params = Promise<{ locale: string }>

export default async function EtapasLandingPagesPage({ params }: { params: Params }) {
  const { locale } = await params
  setRequestLocale(locale)
  const stages = await getLandingPagesProjectStages()
  return (
    <KanbanColumnsConfigView
      title="Etapas do Projeto - Landing Pages"
      subtitle="Configure as etapas dos projetos de landing pages"
      initialColumns={stages}
      createColumn={createLandingPagesProjectStage}
      updateColumn={updateLandingPagesProjectStage}
      reorderColumns={reorderLandingPagesProjectStages}
      deleteColumn={deleteLandingPagesProjectStage}
    />
  )
}
