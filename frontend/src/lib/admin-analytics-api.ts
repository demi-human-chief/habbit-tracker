import { apiJson } from './api'

export type TopEvent = { event_name: string; count: number }
export type DailyCount = { date: string; count: number }
export type EventTimeline = { date: string; event_name: string; count: number }
export type Funnel = {
  registered: number
  created_habit: number
  completed_habit: number
  used_ai: number
  connected_telegram: number
  conversion: {
    created_habit: number
    completed_habit: number
    used_ai: number
    connected_telegram: number
  }
}

export type AnalyticsOverview = {
  total_users: number
  new_users_7d: number
  active_users_7d: number
  events_24h: number
  habits_created: number
  habits_completed: number
  ai_messages: number
  telegram_connected: number
  top_events: TopEvent[]
  daily_active_users: DailyCount[]
  event_timeline: EventTimeline[]
  funnel: Funnel
  retention: {
    day_1: number
    day_3: number
    day_7: number
  }
  sources: {
    web: number
    telegram: number
    ai: number
  }
}

export type AnalyticsEvent = {
  id: string
  user_id: string | null
  event_name: string
  source: string | null
  metadata: Record<string, unknown> | null
  created_at: string
}

export async function getAnalyticsOverview(): Promise<AnalyticsOverview> {
  return apiJson<AnalyticsOverview>('/api/v1/admin/analytics/overview')
}

export async function getAnalyticsEvents(params?: {
  limit?: number
  event_name?: string
  user_id?: string
}): Promise<{ events: AnalyticsEvent[] }> {
  const q = new URLSearchParams()
  if (params?.limit) q.set('limit', String(params.limit))
  if (params?.event_name) q.set('event_name', params.event_name)
  if (params?.user_id) q.set('user_id', params.user_id)
  const suffix = q.toString() ? `?${q.toString()}` : ''
  return apiJson<{ events: AnalyticsEvent[] }>(`/api/v1/admin/analytics/events${suffix}`)
}
