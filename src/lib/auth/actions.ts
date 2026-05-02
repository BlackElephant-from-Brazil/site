'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

const AUTH_ERROR_MAP: Record<string, string> = {
  'Invalid login credentials': 'Email ou senha incorretos.',
  'Email not confirmed': 'Confirme seu email antes de fazer login.',
  'Too many requests': 'Muitas tentativas. Aguarde alguns minutos.',
  'User already registered': 'Este email já está cadastrado.',
}

function translateError(message: string): string {
  return AUTH_ERROR_MAP[message] ?? 'Ocorreu um erro. Tente novamente.'
}

export async function signInWithEmail(formData: FormData) {
  const supabase = await createClient()
  const adminClient = createAdminClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { data: authData, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return { error: translateError(error.message) }
  }

  const { data: userProfile } = await adminClient
    .from('users')
    .select('role')
    .eq('user_id', authData.user.id)
    .single()

  revalidatePath('/', 'layout')

  if (userProfile?.role === 'admin') {
    redirect('/dashboard/admin')
  } else {
    redirect('/dashboard/customer')
  }
}

export async function signUpWithEmail(formData: FormData) {
  const supabase = await createClient()
  const adminClient = createAdminClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const name = (formData.get('name') as string)?.trim()

  if (!name) {
    return { error: 'Nome é obrigatório.' }
  }

  if (password.length < 8) {
    return { error: 'A senha deve ter no mínimo 8 caracteres.' }
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  })

  if (error) {
    return { error: translateError(error.message) }
  }

  if (!data.user) {
    return { error: 'Erro ao criar conta. Tente novamente.' }
  }

  const { error: profileError } = await adminClient
    .from('users')
    .insert({
      user_id: data.user.id,
      email,
      name,
      role: 'customer',
    })

  if (profileError) {
    await adminClient.auth.admin.deleteUser(data.user.id)
    return { error: 'Erro ao criar perfil. Tente novamente.' }
  }

  if (data.session) {
    revalidatePath('/', 'layout')
    redirect('/dashboard/customer')
  }

  return {
    success: true,
    message: 'Verifique seu email para confirmar a conta.',
  }
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}

export async function resetPassword(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/reset-password`,
  })

  if (error) {
    return { error: translateError(error.message) }
  }

  return { success: true, message: 'Verifique seu email para redefinir a senha.' }
}

export async function updatePassword(formData: FormData) {
  const supabase = await createClient()

  const password = formData.get('password') as string

  if (password.length < 8) {
    return { error: 'A senha deve ter no mínimo 8 caracteres.' }
  }

  const { error } = await supabase.auth.updateUser({ password })

  if (error) {
    return { error: translateError(error.message) }
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}
