export interface Team {
  name: string
  order: number
  contact: string | null
  phone: string | null
  comments: string | null
  confirmation_key: string
  num_vegetarians: number | null
  num_participants: number | null
  planned_start_time: string | null
  effective_start_time: string | null
  cancelled: boolean
  is_confirmed: boolean
  accepted: boolean
  completed: boolean
  inserted: string | null
  updated: string | null
  finish_time: string | null
  route_name: string | null
  email: string
}
