export type DashboardHabit = {
  id: string
  title: string
  description: string
  icon: string
  iconShape?: string | null
  iconColor?: string | null
  completed: boolean
}

export type BottomTab = 'today' | 'stats' | 'coach' | 'profile' | 'admin'
