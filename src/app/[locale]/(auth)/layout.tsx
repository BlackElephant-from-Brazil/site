/**
 * Layout para rotas de autenticação (login, signup, forgot-password)
 * Rotas públicas - redireciona para dashboard se já autenticado
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="w-full max-w-md">
        {children}
      </div>
    </div>
  )
}
