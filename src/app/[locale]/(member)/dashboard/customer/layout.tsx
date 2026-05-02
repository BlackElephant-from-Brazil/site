import { getCurrentUser } from '@/lib/supabase/queries/users'
import { signOut } from '@/lib/auth/actions'
import { Logo } from '@/components/ui'

export default async function CustomerLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser()

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      <header
        className="border-b"
        style={{ borderColor: 'var(--card-border)', background: 'var(--nav-background)' }}
      >
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Logo variant="full" size={32} />
          <div className="flex items-center gap-5">
            <div className="text-right">
              <p className="text-xs font-semibold" style={{ color: 'var(--foreground)' }}>
                {user?.name}
              </p>
              <p
                className="text-[0.68rem] uppercase tracking-wider"
                style={{ color: 'var(--primary)' }}
              >
                cliente
              </p>
            </div>
            <form action={signOut}>
              <button
                type="submit"
                className="rounded-md border px-3 py-1.5 text-xs font-medium transition-colors"
                style={{ borderColor: 'var(--card-border)', color: 'var(--foreground-muted)' }}
              >
                Sair
              </button>
            </form>
          </div>
        </nav>
      </header>
      <main className="mx-auto max-w-7xl px-6 py-10">{children}</main>
    </div>
  )
}
