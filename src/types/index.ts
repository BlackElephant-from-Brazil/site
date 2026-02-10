/**
 * Global TypeScript types
 */

// Locales suportados
export type Locale = 'pt' | 'es' | 'en' | 'de' | 'fr' | 'it'

// User types
export interface User {
  id: string
  email: string
  name: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

// API Response types
export interface ApiResponse<T> {
  data: T | null
  error: string | null
}

// Pagination
export interface PaginatedResponse<T> {
  data: T[]
  count: number
  page: number
  pageSize: number
  totalPages: number
}
