export interface Station {
  name: string
  contact: string | null
  phone: string | null
  is_start: boolean
  is_end: boolean
  order: number
}

/** Reduced schema returned for unauthenticated / low-privilege callers. */
export interface StationPublic {
  name: string
  is_start: boolean
  is_end: boolean
  order: number
}

export type AnyStation = Station | StationPublic

export function isFullStation(station: AnyStation): station is Station {
  return 'contact' in station
}

export function isPublicStation(station: AnyStation): station is StationPublic {
  return !isFullStation(station)
}
