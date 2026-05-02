/**
 * Supabase Clients
 * 
 * Exporta os clientes Supabase para uso em diferentes contextos.
 * 
 * REGRAS IMPORTANTES:
 * - Use `createClient` de './server' em Server Components e Server Actions
 * - Use `createClient` de './client' APENAS para autenticação no browser
 * - NUNCA faça queries de dados diretamente do cliente
 */

export { createClient as createServerClient } from './server'
export { createClient as createBrowserClient } from './client'
