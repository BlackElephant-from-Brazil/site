-- Migration: 004_projects_add_is_internal
-- Adds is_internal flag to projects. Internal projects have no client or service value.

ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS is_internal BOOLEAN NOT NULL DEFAULT FALSE;
