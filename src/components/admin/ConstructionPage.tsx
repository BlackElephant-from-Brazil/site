import { AdminPageHeader } from '@/components/admin/AdminPageHeader'

interface Props {
  title: string
  subtitle?: string
}

export function ConstructionPage({ title, subtitle }: Props) {
  return (
    <div>
      <AdminPageHeader title={title} subtitle={subtitle} />
      <p className="text-base italic" style={{ color: 'var(--foreground-muted)' }}>
        Sistema em construção.
      </p>
    </div>
  )
}
