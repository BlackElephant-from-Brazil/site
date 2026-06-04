-- Migration: 014_kanban_cards_add_hours_worked
-- Adiciona campo de horas trabalhadas manualmente em um card do kanban.

ALTER TABLE public.kanban_cards
  ADD COLUMN IF NOT EXISTS hours_worked NUMERIC(8,2);
