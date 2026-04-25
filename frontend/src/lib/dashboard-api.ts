import { apiJson } from './api'

export type HabitTodayItem = {
  id: string
  name: string
  description: string | null
  color: string | null
  icon: string | null
  sort_order: number
  metadata: Record<string, unknown> | null
  completed_today: boolean
}

export type DashboardTodayResponse = {
  date: string
  habits: HabitTodayItem[]
  total_count: number
  completed_count: number
  completion_percent: number
  streak: number
  ring_habits: number
  ring_consistency: number
  ring_focus: number
}

export type HabitPublic = {
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

export async function getTodayDashboard(): Promise<DashboardTodayResponse> {
  return apiJson<DashboardTodayResponse>('/api/v1/dashboard/today')
}

export async function createHabit(payload: {
  name: string
  description?: string | null
  icon?: string | null
}): Promise<HabitPublic> {
  return apiJson<HabitPublic>('/api/v1/habits/', {
    method: 'POST',
    body: JSON.stringify({
      name: payload.name,
      description: payload.description ?? null,
      icon: payload.icon ?? null,
    }),
  })
}

export async function toggleHabitToday(
  habitId: string
): Promise<{ habit_id: string; completed_today: boolean }> {
  return apiJson<{ habit_id: string; completed_today: boolean }>(
    `/api/v1/habits/${habitId}/toggle-today`,
    { method: 'POST' }
  )
}
