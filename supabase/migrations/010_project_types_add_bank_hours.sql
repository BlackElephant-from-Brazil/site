-- Migration: 010_project_types_add_bank_hours
-- Adiciona suporte a banco de horas mensal nos tipos de projeto.

ALTER TABLE public.project_types
  ADD COLUMN IF NOT EXISTS monthly_hours NUMERIC(8,2),
  ADD COLUMN IF NOT EXISTS has_monthly_bank BOOLEAN NOT NULL DEFAULT false;
