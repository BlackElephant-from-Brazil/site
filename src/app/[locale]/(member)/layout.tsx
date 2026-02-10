/**
 * Layout para rotas de membros (dashboard, profile, settings)
 * Rotas protegidas - requer autenticação
 * 
 * TODO: Reativar verificação de auth quando Supabase estiver configurado
 * import { getCurrentUser } from '@/lib/supabase/queries/users'
 * import { redirect } from 'next/navigation'
 */
export default async function MemberLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // TODO: Descomentar quando Supabase estiver configurado
  // const user = await getCurrentUser()
  // if (!user) {
  //   redirect('/login')
  // }

  // Mock user para desenvolvimento
  const mockUser = {
    email: 'usuario@exemplo.com',
  }

  return (
    <div className="min-h-screen">
      {/* Header com navegação do membro - implementar depois */}
      <header className="border-b px-4 py-4" style={{ borderColor: 'var(--card-border)' }}>
        <nav className="site-container flex items-center justify-between">
          <span className="font-bold">Black Elephant</span>
          <span className="text-sm" style={{ color: 'var(--foreground-muted)' }}>
            {mockUser.email}
          </span>
        </nav>
      </header>
      
      <main className="site-container py-8">
        {children}
      </main>
    </div>
  )
}
