-- Adiciona o campo "formato da entrega" em project_types.
-- Determina em qual kanban os projetos deste tipo aparecerão.
-- DEFAULT 'software' garante que todos os registros existentes recebam o valor correto.

ALTER TABLE public.project_types
  ADD COLUMN IF NOT EXISTS delivery_format TEXT NOT NULL DEFAULT 'software'
    CHECK (delivery_format IN ('software', 'site', 'landing_page'));
