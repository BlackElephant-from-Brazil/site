-- Migration: 005_project_types_add_is_internal
-- Internal project types have no billing (no recurring flag, no values).

ALTER TABLE public.project_types
  ADD COLUMN IF NOT EXISTS is_internal BOOLEAN NOT NULL DEFAULT FALSE;
