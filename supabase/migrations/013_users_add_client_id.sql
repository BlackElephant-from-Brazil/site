-- Migration: 013_users_add_client_id
-- Links customer users to the client company they are responsible for.

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_users_client ON public.users(client_id);
