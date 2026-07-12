-- Migration: 022_portfolio_create
-- Cria as tabelas de itens de portfólio e suas imagens (módulo interno de conteúdo do site).

CREATE TABLE IF NOT EXISTS public.portfolio_items (
  id              UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  slug            TEXT        NOT NULL UNIQUE,
  title           TEXT        NOT NULL,
  description     TEXT        NOT NULL,
  keywords        TEXT[]      NOT NULL DEFAULT '{}',
  project_type_id UUID        REFERENCES public.project_types(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
  updated_at      TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

ALTER TABLE public.portfolio_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "portfolio_items_admin" ON public.portfolio_items
  FOR ALL TO authenticated
  USING  (EXISTS (SELECT 1 FROM public.users WHERE user_id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE user_id = auth.uid() AND role = 'admin'));

CREATE TRIGGER trg_portfolio_items_updated
  BEFORE UPDATE ON public.portfolio_items
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX IF NOT EXISTS idx_portfolio_items_type ON public.portfolio_items(project_type_id);

CREATE TABLE IF NOT EXISTS public.portfolio_images (
  id                  UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  portfolio_item_id   UUID        NOT NULL REFERENCES public.portfolio_items(id) ON DELETE CASCADE,
  image_url           TEXT        NOT NULL,
  is_cover            BOOLEAN     NOT NULL DEFAULT FALSE,
  position            INTEGER     NOT NULL DEFAULT 0,
  created_at          TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

ALTER TABLE public.portfolio_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "portfolio_images_admin" ON public.portfolio_images
  FOR ALL TO authenticated
  USING  (EXISTS (SELECT 1 FROM public.users WHERE user_id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE user_id = auth.uid() AND role = 'admin'));

CREATE INDEX IF NOT EXISTS idx_portfolio_images_item ON public.portfolio_images(portfolio_item_id);
