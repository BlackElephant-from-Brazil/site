// ─── Auth ───────────────────────────────────────────────────
export type Locale = 'en' | 'pt-br' | 'pt-pt' | 'es'
export type UserRole = 'admin' | 'customer'

export interface User {
  id: string
  user_id: string
  email: string
  name: string
  role: UserRole
  client_id: string | null
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

export type DeliveryFormat = 'software' | 'site' | 'landing_page'

export interface ProjectType {
  id: string
  name: string
  is_internal: boolean
  is_recurring: boolean
  one_time_value: number | null
  recurring_value: number | null
  monthly_hours: number | null
  has_monthly_bank: boolean
  delivery_format: DeliveryFormat
  created_at: string
  updated_at: string
}

export type ClientType = 'cliente' | 'parceiro'

export interface Client {
  id: string
  trade_name: string
  cnpj: string | null
  company_name: string | null
  logo_url: string | null
  client_type: ClientType
  created_at: string
  updated_at: string
}

export interface Project {
  id: string
  client_id: string | null
  project_type_id: string | null
  software_stage_id: string | null
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
  hours_worked: number | null
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

// ─── Generic Board types (used by KanbanBoard and CardDetailModal) ────────────
export interface KanbanBoardProject {
  id: string
  name: string
  acronym: string
  client_id: string | null
  client?: Pick<Client, 'id' | 'trade_name'> | null
}

export interface KanbanBoardCard extends KanbanCard {
  project: KanbanBoardProject | null
  assignee: Pick<User, 'id' | 'name' | 'avatar_url'> | null
}

export interface KanbanBoardColumn extends KanbanColumn {
  cards: KanbanBoardCard[]
}

// ─── Sites ───────────────────────────────────────────────────────────────────
export interface SitesProject {
  id: string
  client_id: string | null
  site_stage_id: string | null
  name: string
  acronym: string
  is_internal: boolean
  created_at: string
  updated_at: string
}

export interface SitesProjectWithClient extends SitesProject {
  client: Client | null
}

export interface SitesKanbanCardWithProject extends KanbanCard {
  project: SitesProjectWithClient | null
  assignee: Pick<User, 'id' | 'name' | 'avatar_url'> | null
}

export interface SitesKanbanColumnWithCards extends KanbanColumn {
  cards: SitesKanbanCardWithProject[]
}

// ─── Landing Pages ────────────────────────────────────────────────────────────
export interface LandingPageProject {
  id: string
  client_id: string | null
  landing_page_stage_id: string | null
  name: string
  acronym: string
  is_internal: boolean
  created_at: string
  updated_at: string
}

export interface LandingPageProjectWithClient extends LandingPageProject {
  client: Client | null
}

export interface LandingPageKanbanCardWithProject extends KanbanCard {
  project: LandingPageProjectWithClient | null
  assignee: Pick<User, 'id' | 'name' | 'avatar_url'> | null
}

export interface LandingPageKanbanColumnWithCards extends KanbanColumn {
  cards: LandingPageKanbanCardWithProject[]
}

// ─── Goals ───────────────────────────────────────────────────
export interface Goal {
  id: string
  name: string
  objective: string
  created_at: string
  updated_at: string
}

export interface GoalActivity {
  id: string
  goal_id: string
  parent_id: string | null
  title: string
  is_completed: boolean
  position: number
  created_at: string
  updated_at: string
}

export interface GoalActivityWithChildren extends GoalActivity {
  children: GoalActivityWithChildren[]
}

export interface GoalWithActivities extends Goal {
  activities: GoalActivity[]
}

export interface GoalWithProgress extends Goal {
  total: number
  completed: number
}

// ─── User Widgets ─────────────────────────────────────────────
export interface UserTodo {
  id: string
  user_id: string
  title: string
  description: string | null
  due_date: string | null
  is_completed: boolean
  completed_at: string | null
  created_at: string
  updated_at: string
}

export interface UserNote {
  id: string
  user_id: string
  content: string
  color: string
  created_at: string
  updated_at: string
}

export interface UserPassword {
  id: string
  user_id: string
  service_name: string
  username: string | null
  password: string
  url: string | null
  created_at: string
  updated_at: string
}

// ─── Agenda ──────────────────────────────────────────────────
export interface AgendaEntry {
  id: string
  user_id: string
  client_id: string | null
  project_id: string | null
  kanban_card_id: string | null
  date: string
  start_time: string | null
  minutes: number
  description: string | null
  created_at: string
  updated_at: string
}

export interface AgendaEntryWithRefs extends AgendaEntry {
  client: Client | null
  project: Project | null
  kanban_card: Pick<KanbanCard, 'id' | 'name' | 'card_number'> | null
}

export interface UserAgendaSummary {
  user: User
  total_minutes: number
}

export interface ProjectBankSummary {
  project: ProjectWithRefs
  used_minutes: number
  available_hours: number | null
}

// ─── Site (Blog / Portfólio / Planos) ─────────────────────────
export interface BlogPost {
  id: string
  slug: string
  title: string
  excerpt: string
  keywords: string[]
  author_id: string | null
  cover_image_url: string | null
  content_html: string
  published_at: string
  created_at: string
  updated_at: string
}

export interface BlogPostWithAuthor extends BlogPost {
  author: Pick<User, 'id' | 'name'> | null
}

export interface PortfolioItem {
  id: string
  slug: string
  title: string
  description: string
  keywords: string[]
  project_type_id: string | null
  created_at: string
  updated_at: string
}

export interface PortfolioImage {
  id: string
  portfolio_item_id: string
  image_url: string
  is_cover: boolean
  position: number
  created_at: string
}

export interface PortfolioItemWithRefs extends PortfolioItem {
  project_type: ProjectType | null
  images: PortfolioImage[]
}

export interface PricingPlan {
  id: string
  name: string
  price: number
  project_type_id: string | null
  position: number
  created_at: string
  updated_at: string
}

export interface PricingPlanBenefit {
  id: string
  pricing_plan_id: string
  label: string
  position: number
  created_at: string
}

export interface PricingPlanWithRefs extends PricingPlan {
  project_type: ProjectType | null
  benefits: PricingPlanBenefit[]
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
