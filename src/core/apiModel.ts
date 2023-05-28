import type { Moment } from 'moment'

export type ApiDashboardStationState = {
  name: string
  score: number | null
  state: string // TODO enum?
}

// TODO: This is mostly redundant with ApiDashboardStationState
export type ApiRelatedDashboardStationState = {
  team: string
  state: string // TODO enum?
  score: number | null
  updated: string
  updateAge: number
  updateParsed: Moment
  ageClass?: { ancient?: boolean; old?: boolean; recent?: boolean }
}

export type ApiDashboardItem = {
  stations: ApiDashboardStationState[]
  team: string
}
