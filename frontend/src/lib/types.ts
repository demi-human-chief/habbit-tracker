export type User = {
  id: string
  email: string
  display_name: string | null
  is_admin: boolean
  telegram_id: number | null
  created_at: string
}

export type Habit = {
  id: string
  user_id: string
  name: string
  description: string | null
  color: string | null
  icon: string | null
  is_archived: boolean
  sort_order: number
  metadata: Record<string, unknown> | null
  created_at: string
  updated_at: string
}

export type TokenResponse = {
  access_token: string
  token_type: string
}
