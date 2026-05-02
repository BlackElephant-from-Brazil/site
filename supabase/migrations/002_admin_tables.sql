-- Migration: 002_admin_tables

-- ──────────────────────────────────────────────
-- kanban_columns
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.kanban_columns (
  id         UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  name       TEXT        NOT NULL,
  position   INTEGER     NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

ALTER TABLE public.kanban_columns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "kanban_columns_admin" ON public.kanban_columns
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users WHERE user_id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE user_id = auth.uid() AND role = 'admin'));

-- ──────────────────────────────────────────────
-- project_types
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.project_types (
  id            UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  name          TEXT         NOT NULL,
  is_recurring  BOOLEAN      NOT NULL DEFAULT FALSE,
  service_value NUMERIC(12,2),
  created_at    TIMESTAMPTZ  DEFAULT TIMEZONE('utc', NOW()),
  updated_at    TIMESTAMPTZ  DEFAULT TIMEZONE('utc', NOW())
);

ALTER TABLE public.project_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "project_types_admin" ON public.project_types
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users WHERE user_id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE user_id = auth.uid() AND role = 'admin'));

-- ──────────────────────────────────────────────
-- clients
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.clients (
  id           UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  trade_name   TEXT        NOT NULL,
  cnpj         TEXT,
  company_name TEXT,
  logo_url     TEXT,
  created_at   TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
  updated_at   TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "clients_admin" ON public.clients
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users WHERE user_id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE user_id = auth.uid() AND role = 'admin'));

-- ──────────────────────────────────────────────
-- projects
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.projects (
  id              UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id       UUID         REFERENCES public.clients(id) ON DELETE SET NULL,
  project_type_id UUID         REFERENCES public.project_types(id) ON DELETE SET NULL,
  name            TEXT         NOT NULL,
  acronym         TEXT         NOT NULL,
  service_value   NUMERIC(12,2),
  created_at      TIMESTAMPTZ  DEFAULT TIMEZONE('utc', NOW()),
  updated_at      TIMESTAMPTZ  DEFAULT TIMEZONE('utc', NOW())
);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "projects_admin" ON public.projects
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users WHERE user_id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE user_id = auth.uid() AND role = 'admin'));

-- ──────────────────────────────────────────────
-- kanban_cards
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.kanban_cards (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  column_id   UUID        NOT NULL REFERENCES public.kanban_columns(id) ON DELETE CASCADE,
  project_id  UUID        REFERENCES public.projects(id) ON DELETE SET NULL,
  name        TEXT        NOT NULL,
  description TEXT,
  card_number INTEGER     NOT NULL DEFAULT 1,
  position    INTEGER     NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
  updated_at  TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

ALTER TABLE public.kanban_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "kanban_cards_admin" ON public.kanban_cards
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users WHERE user_id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE user_id = auth.uid() AND role = 'admin'));

-- ──────────────────────────────────────────────
-- Indexes
-- ──────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_kanban_columns_position ON public.kanban_columns(position);
CREATE INDEX IF NOT EXISTS idx_kanban_cards_column     ON public.kanban_cards(column_id);
CREATE INDEX IF NOT EXISTS idx_kanban_cards_project    ON public.kanban_cards(project_id);
CREATE INDEX IF NOT EXISTS idx_projects_client         ON public.projects(client_id);

-- ──────────────────────────────────────────────
-- updated_at triggers
-- ──────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_kanban_columns_updated BEFORE UPDATE ON public.kanban_columns FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_project_types_updated  BEFORE UPDATE ON public.project_types   FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_clients_updated        BEFORE UPDATE ON public.clients          FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_projects_updated       BEFORE UPDATE ON public.projects         FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_kanban_cards_updated   BEFORE UPDATE ON public.kanban_cards     FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
