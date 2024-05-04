import { Station } from './station'
import { Team } from './team'

export interface AssignmentMap {
  teams: { [key: string]: Team[] }
  stations: { [key: string]: Station[] }
}
