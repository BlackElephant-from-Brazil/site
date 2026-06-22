-- Migration: 020_projects_add_stage_ids
-- Vincula cada projeto à sua etapa atual, por módulo.

ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS software_stage_id UUID REFERENCES public.project_stages(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_projects_software_stage ON public.projects(software_stage_id);

ALTER TABLE public.sites_projects
  ADD COLUMN IF NOT EXISTS site_stage_id UUID REFERENCES public.sites_project_stages(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_sites_projects_stage ON public.sites_projects(site_stage_id);

ALTER TABLE public.landing_pages_projects
  ADD COLUMN IF NOT EXISTS landing_page_stage_id UUID REFERENCES public.landing_pages_project_stages(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_landing_pages_projects_stage ON public.landing_pages_projects(landing_page_stage_id);
