// ─── Auth ───────────────────────────────────────────────────
export type Locale = 'pt' | 'es' | 'en' | 'de' | 'fr' | 'it'
export type UserRole = 'admin' | 'customer'

export interface User {
  id: string
  user_id: string
  email: string
  name: string
  role: UserRole
  avatar_url: string | null
  created_at: string
  updated_at: string
}

// ─── Admin domain ────────────────────────────────────────────
export interface KanbanColumn {
  id: string
  name: string
  position: number
  created_at: string
  updated_at: string
}

export interface ProjectType {
  id: string
  name: string
  is_internal: boolean
  is_recurring: boolean
  one_time_value: number | null
  recurring_value: number | null
  created_at: string
  updated_at: string
}

export interface Client {
  id: string
  trade_name: string
  cnpj: string | null
  company_name: string | null
  logo_url: string | null
  created_at: string
  updated_at: string
}

export interface Project {
  id: string
  client_id: string | null
  project_type_id: string | null
  name: string
  acronym: string
  is_internal: boolean
  service_value: number | null
  created_at: string
  updated_at: string
}

export interface ProjectWithRefs extends Project {
  client: Client | null
  project_type: ProjectType | null
}

export interface KanbanCard {
  id: string
  column_id: string
  project_id: string | null
  assignee_id: string | null
  name: string
  description: string | null
  card_number: number
  position: number
  created_at: string
  updated_at: string
}

export interface KanbanCardWithProject extends KanbanCard {
  project: ProjectWithRefs | null
  assignee: Pick<User, 'id' | 'name' | 'avatar_url'> | null
}

export interface KanbanColumnWithCards extends KanbanColumn {
  cards: KanbanCardWithProject[]
}

// ─── Shared ──────────────────────────────────────────────────
export interface ApiResponse<T> {
  data: T | null
  error: string | null
}

export interface PaginatedResponse<T> {
  data: T[]
  count: number
  page: number
  pageSize: number
  totalPages: number
}
