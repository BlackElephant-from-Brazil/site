-- Migration: 007_kanban_cards_add_assignee
-- Adiciona responsável (usuário admin) ao card do Kanban.

ALTER TABLE public.kanban_cards
  ADD COLUMN IF NOT EXISTS assignee_id UUID REFERENCES public.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_kanban_cards_assignee ON public.kanban_cards(assignee_id);
