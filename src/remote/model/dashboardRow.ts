export interface DashboardRow {
  team: string
  team_has_cancelled: boolean
  stations: { name: string; score: number; state: string }[]
}
