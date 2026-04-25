import { apiJson } from './api'

export type HeatmapPoint = {
  date: string
  count: number
}

export type StatsOverview = {
  current_streak: number
  best_streak: number
  completion_rate: number
  weekly: number[]
  heatmap: HeatmapPoint[]
}

export type HabitStat = {
  id: string
  title: string
  completion_rate: number
  missed_count: number
}

export async function getStatsOverview(): Promise<StatsOverview> {
  return apiJson<StatsOverview>('/api/v1/stats/overview')
}

export async function getHabitStats(): Promise<HabitStat[]> {
  return apiJson<HabitStat[]>('/api/v1/stats/habits')
}
