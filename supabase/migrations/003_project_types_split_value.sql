-- Migration: 003_project_types_split_value
-- Rename the existing single service_value into two columns: one for one-time projects,
-- one for recurring (monthly) projects.

ALTER TABLE public.project_types
  RENAME COLUMN service_value TO one_time_value;

ALTER TABLE public.project_types
  ADD COLUMN IF NOT EXISTS recurring_value NUMERIC(12,2);
