-- Adiciona o campo "tipo" em clients: 'cliente' ou 'parceiro'.
-- DEFAULT 'cliente' garante que todos os registros existentes recebam o valor correto.

ALTER TABLE public.clients
  ADD COLUMN IF NOT EXISTS client_type TEXT NOT NULL DEFAULT 'cliente'
    CHECK (client_type IN ('cliente', 'parceiro'));
