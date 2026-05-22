-- Migration: 011_agenda_entries_create
-- Tabela de registros de horas da agenda dos administradores.

CREATE TABLE IF NOT EXISTS public.agenda_entries (
  id             UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id        UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id      UUID        REFERENCES public.clients(id)       ON DELETE SET NULL,
  project_id     UUID        REFERENCES public.projects(id)      ON DELETE SET NULL,
  kanban_card_id UUID        REFERENCES public.kanban_cards(id)  ON DELETE SET NULL,
  date           DATE        NOT NULL,
  start_time     TIME,
  minutes        INTEGER     NOT NULL CHECK (minutes > 0),
  description    TEXT,
  created_at     TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
  updated_at     TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

ALTER TABLE public.agenda_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "agenda_entries_admin" ON public.agenda_entries
  FOR ALL TO authenticated
  USING  (EXISTS (SELECT 1 FROM public.users WHERE user_id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE user_id = auth.uid() AND role = 'admin'));

CREATE TRIGGER trg_agenda_entries_updated
  BEFORE UPDATE ON public.agenda_entries
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX IF NOT EXISTS idx_agenda_entries_user    ON public.agenda_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_agenda_entries_client  ON public.agenda_entries(client_id);
CREATE INDEX IF NOT EXISTS idx_agenda_entries_project ON public.agenda_entries(project_id);
CREATE INDEX IF NOT EXISTS idx_agenda_entries_date    ON public.agenda_entries(date);
