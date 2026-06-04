-- Migration: 015_sites_kanban
-- Cria tabelas de projetos e kanban para o módulo Sites.

CREATE TABLE IF NOT EXISTS public.sites_projects (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id   UUID        REFERENCES public.clients(id) ON DELETE SET NULL,
  name        TEXT        NOT NULL,
  acronym     TEXT        NOT NULL,
  is_internal BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
  updated_at  TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

ALTER TABLE public.sites_projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sites_projects_admin" ON public.sites_projects
  FOR ALL TO authenticated
  USING  (EXISTS (SELECT 1 FROM public.users WHERE user_id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE user_id = auth.uid() AND role = 'admin'));

CREATE TRIGGER trg_sites_projects_updated
  BEFORE UPDATE ON public.sites_projects
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX IF NOT EXISTS idx_sites_projects_client ON public.sites_projects(client_id);

-- ─── Sites Kanban Columns ────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.sites_kanban_columns (
  id         UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  name       TEXT        NOT NULL,
  position   INTEGER     NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

ALTER TABLE public.sites_kanban_columns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sites_kanban_columns_admin" ON public.sites_kanban_columns
  FOR ALL TO authenticated
  USING  (EXISTS (SELECT 1 FROM public.users WHERE user_id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE user_id = auth.uid() AND role = 'admin'));

CREATE TRIGGER trg_sites_kanban_columns_updated
  BEFORE UPDATE ON public.sites_kanban_columns
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX IF NOT EXISTS idx_sites_kanban_columns_position ON public.sites_kanban_columns(position);

-- ─── Sites Kanban Cards ──────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.sites_kanban_cards (
  id           UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  column_id    UUID        NOT NULL REFERENCES public.sites_kanban_columns(id) ON DELETE CASCADE,
  project_id   UUID        REFERENCES public.sites_projects(id) ON DELETE SET NULL,
  assignee_id  UUID        REFERENCES public.users(id) ON DELETE SET NULL,
  name         TEXT        NOT NULL,
  description  TEXT,
  hours_worked NUMERIC(8,2),
  card_number  INTEGER     NOT NULL DEFAULT 1,
  position     INTEGER     NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
  updated_at   TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

ALTER TABLE public.sites_kanban_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sites_kanban_cards_admin" ON public.sites_kanban_cards
  FOR ALL TO authenticated
  USING  (EXISTS (SELECT 1 FROM public.users WHERE user_id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE user_id = auth.uid() AND role = 'admin'));

CREATE TRIGGER trg_sites_kanban_cards_updated
  BEFORE UPDATE ON public.sites_kanban_cards
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX IF NOT EXISTS idx_sites_kanban_cards_column   ON public.sites_kanban_cards(column_id);
CREATE INDEX IF NOT EXISTS idx_sites_kanban_cards_project  ON public.sites_kanban_cards(project_id);
CREATE INDEX IF NOT EXISTS idx_sites_kanban_cards_assignee ON public.sites_kanban_cards(assignee_id);
