-- Migration: 023_pricing_plans_create
-- Cria as tabelas de planos e preços e seus itens de benefício (módulo interno de conteúdo do site).

CREATE TABLE IF NOT EXISTS public.pricing_plans (
  id              UUID          DEFAULT gen_random_uuid() PRIMARY KEY,
  name            TEXT          NOT NULL,
  price           NUMERIC(12,2) NOT NULL,
  project_type_id UUID          REFERENCES public.project_types(id) ON DELETE SET NULL,
  position        INTEGER       NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ   DEFAULT TIMEZONE('utc', NOW()),
  updated_at      TIMESTAMPTZ   DEFAULT TIMEZONE('utc', NOW())
);

ALTER TABLE public.pricing_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pricing_plans_admin" ON public.pricing_plans
  FOR ALL TO authenticated
  USING  (EXISTS (SELECT 1 FROM public.users WHERE user_id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE user_id = auth.uid() AND role = 'admin'));

CREATE TRIGGER trg_pricing_plans_updated
  BEFORE UPDATE ON public.pricing_plans
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX IF NOT EXISTS idx_pricing_plans_type ON public.pricing_plans(project_type_id);

CREATE TABLE IF NOT EXISTS public.pricing_plan_benefits (
  id              UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  pricing_plan_id UUID        NOT NULL REFERENCES public.pricing_plans(id) ON DELETE CASCADE,
  label           TEXT        NOT NULL,
  position        INTEGER     NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

ALTER TABLE public.pricing_plan_benefits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pricing_plan_benefits_admin" ON public.pricing_plan_benefits
  FOR ALL TO authenticated
  USING  (EXISTS (SELECT 1 FROM public.users WHERE user_id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE user_id = auth.uid() AND role = 'admin'));

CREATE INDEX IF NOT EXISTS idx_pricing_plan_benefits_plan ON public.pricing_plan_benefits(pricing_plan_id);
