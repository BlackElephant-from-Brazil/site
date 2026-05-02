import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * Callback para OAuth e confirmação de email
 * Processa o código de autenticação e redireciona o usuário
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Retornar para a página de erro em caso de falha
  return NextResponse.redirect(`${origin}/auth/auth-error`)
}
