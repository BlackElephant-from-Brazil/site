import { setRequestLocale } from 'next-intl/server'
import {
  getSitesProjectStages,
  createSitesProjectStage,
  updateSitesProjectStage,
  reorderSitesProjectStages,
  deleteSitesProjectStage,
} from '@/lib/actions/sites-project-stages'
import { KanbanColumnsConfigView } from '@/components/admin/views/KanbanColumnsConfigView'

export const dynamic = 'force-dynamic'

type Params = Promise<{ locale: string }>

export default async function EtapasSitesPage({ params }: { params: Params }) {
  const { locale } = await params
  setRequestLocale(locale)
  const stages = await getSitesProjectStages()
  return (
    <KanbanColumnsConfigView
      title="Etapas do Projeto - Sites"
      subtitle="Configure as etapas dos projetos de sites"
      initialColumns={stages}
      createColumn={createSitesProjectStage}
      updateColumn={updateSitesProjectStage}
      reorderColumns={reorderSitesProjectStages}
      deleteColumn={deleteSitesProjectStage}
    />
  )
}
