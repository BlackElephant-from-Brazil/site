import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Cria um cliente Supabase para uso em Server Components e Server Actions
 * NUNCA exponha este cliente no lado do cliente
 */
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // O método `setAll` foi chamado de um Server Component.
            // Isso pode ser ignorado se você tiver middleware atualizando
            // as sessões do usuário.
          }
        },
      },
    }
  )
}
