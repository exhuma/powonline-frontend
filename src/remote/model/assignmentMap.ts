import type { AnyStation } from './station'
import type { AnyTeam } from './team'

export interface AssignmentMap {
  teams: { [key: string]: AnyTeam[] }
  stations: { [key: string]: AnyStation[] }
}
