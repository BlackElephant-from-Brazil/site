-- Migration: 012_goal_activities_add_parent
-- Adiciona suporte a sub-atividades ilimitadas via self-reference.

ALTER TABLE public.goal_activities
  ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES public.goal_activities(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_goal_activities_parent ON public.goal_activities(parent_id);
