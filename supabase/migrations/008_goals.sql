-- Migration: 008_goals
-- Tabelas de metas da empresa (goals) e suas atividades (goal_activities).

CREATE TABLE IF NOT EXISTS public.goals (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  name        TEXT        NOT NULL,
  objective   TEXT        NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
  updated_at  TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "goals_admin" ON public.goals
  FOR ALL TO authenticated
  USING  (EXISTS (SELECT 1 FROM public.users WHERE user_id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE user_id = auth.uid() AND role = 'admin'));

CREATE TRIGGER trg_goals_updated
  BEFORE UPDATE ON public.goals
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.goal_activities (
  id           UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  goal_id      UUID        NOT NULL REFERENCES public.goals(id) ON DELETE CASCADE,
  title        TEXT        NOT NULL,
  is_completed BOOLEAN     NOT NULL DEFAULT false,
  position     INTEGER     NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
  updated_at   TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

ALTER TABLE public.goal_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "goal_activities_admin" ON public.goal_activities
  FOR ALL TO authenticated
  USING  (EXISTS (SELECT 1 FROM public.users WHERE user_id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE user_id = auth.uid() AND role = 'admin'));

CREATE TRIGGER trg_goal_activities_updated
  BEFORE UPDATE ON public.goal_activities
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX IF NOT EXISTS idx_goal_activities_goal ON public.goal_activities(goal_id);
