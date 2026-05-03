-- Migration: 006_users_add_avatar_url
-- Adiciona campo de foto de perfil na tabela de usuários.

ALTER TABLE public.users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
