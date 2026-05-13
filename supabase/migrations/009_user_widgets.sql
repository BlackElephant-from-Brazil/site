-- Migration: 009_user_widgets
-- Tabelas individuais por usuário: todo list, notas adesivas e senhas.

-- ─── user_todos ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.user_todos (
  id           UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id      UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title        TEXT        NOT NULL,
  description  TEXT,
  due_date     TIMESTAMPTZ,
  is_completed BOOLEAN     NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  created_at   TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
  updated_at   TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

ALTER TABLE public.user_todos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_todos_own" ON public.user_todos
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER trg_user_todos_updated
  BEFORE UPDATE ON public.user_todos
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX IF NOT EXISTS idx_user_todos_user ON public.user_todos(user_id);

-- ─── user_notes ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.user_notes (
  id         UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content    TEXT        NOT NULL DEFAULT '',
  color      TEXT        NOT NULL DEFAULT '#2a2a1a',
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

ALTER TABLE public.user_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_notes_own" ON public.user_notes
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER trg_user_notes_updated
  BEFORE UPDATE ON public.user_notes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX IF NOT EXISTS idx_user_notes_user ON public.user_notes(user_id);

-- ─── user_passwords ──────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.user_passwords (
  id           UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id      UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  service_name TEXT        NOT NULL,
  username     TEXT,
  password     TEXT        NOT NULL,
  url          TEXT,
  created_at   TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
  updated_at   TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

ALTER TABLE public.user_passwords ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_passwords_own" ON public.user_passwords
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER trg_user_passwords_updated
  BEFORE UPDATE ON public.user_passwords
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX IF NOT EXISTS idx_user_passwords_user ON public.user_passwords(user_id);
