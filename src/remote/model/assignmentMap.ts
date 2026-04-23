import type { Station } from './station'
import type { Team } from './team'

export interface AssignmentMap {
  teams: { [key: string]: Team[] }
  stations: { [key: string]: Station[] }
}
