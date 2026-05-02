import { createBrowserClient } from '@supabase/ssr'

/**
 * Cria um cliente Supabase para uso no navegador (Client Components)
 * Use APENAS para autenticação (login, logout, OAuth)
 * NUNCA faça queries de dados diretamente do cliente
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
