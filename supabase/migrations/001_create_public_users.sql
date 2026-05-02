-- Migration: 001_create_public_users
-- Tabela de usuários no schema public do projeto Black Elephant.
-- Sem trigger para espelhar auth.users — o registro é criado manualmente via server action no cadastro.

CREATE TABLE IF NOT EXISTS public.users (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID        NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
  updated_at  TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
  email       TEXT        NOT NULL,
  name        TEXT        NOT NULL,
  role        TEXT        NOT NULL DEFAULT 'customer' CHECK (role IN ('admin', 'customer'))
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Usuários autenticados podem visualizar apenas o próprio perfil
CREATE POLICY "users_select_own" ON public.users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Usuários autenticados podem atualizar o próprio perfil
CREATE POLICY "users_update_own" ON public.users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
