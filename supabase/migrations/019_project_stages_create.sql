-- Migration: 019_project_stages_create
-- Cria as tabelas de etapas de projeto para os módulos Software, Sites e Landing Pages.

-- ─── Etapas — Software ───────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.project_stages (
  id         UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  name       TEXT        NOT NULL,
  position   INTEGER     NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

ALTER TABLE public.project_stages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "project_stages_admin" ON public.project_stages
  FOR ALL TO authenticated
  USING  (EXISTS (SELECT 1 FROM public.users WHERE user_id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE user_id = auth.uid() AND role = 'admin'));

CREATE TRIGGER trg_project_stages_updated
  BEFORE UPDATE ON public.project_stages
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX IF NOT EXISTS idx_project_stages_position ON public.project_stages(position);

-- ─── Etapas — Sites ──────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.sites_project_stages (
  id         UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  name       TEXT        NOT NULL,
  position   INTEGER     NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

ALTER TABLE public.sites_project_stages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sites_project_stages_admin" ON public.sites_project_stages
  FOR ALL TO authenticated
  USING  (EXISTS (SELECT 1 FROM public.users WHERE user_id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE user_id = auth.uid() AND role = 'admin'));

CREATE TRIGGER trg_sites_project_stages_updated
  BEFORE UPDATE ON public.sites_project_stages
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX IF NOT EXISTS idx_sites_project_stages_position ON public.sites_project_stages(position);

-- ─── Etapas — Landing Pages ──────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.landing_pages_project_stages (
  id         UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  name       TEXT        NOT NULL,
  position   INTEGER     NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

ALTER TABLE public.landing_pages_project_stages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "landing_pages_project_stages_admin" ON public.landing_pages_project_stages
  FOR ALL TO authenticated
  USING  (EXISTS (SELECT 1 FROM public.users WHERE user_id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE user_id = auth.uid() AND role = 'admin'));

CREATE TRIGGER trg_landing_pages_project_stages_updated
  BEFORE UPDATE ON public.landing_pages_project_stages
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX IF NOT EXISTS idx_landing_pages_project_stages_position ON public.landing_pages_project_stages(position);
