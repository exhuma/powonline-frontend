export interface DashboardRow {
  team: string
  stations: { name: string; score: number; state: string }[]
}
