export interface RouteData {
  route: RouteStop[]
  vehicle: Vehicle
  description: Description
}

export interface RouteStop {
  id: number
  departure: Departure
  arrival: Arrival
  location: Location
  allow_boarding: boolean
  allow_drop_off: boolean
  booking_cut_off_mins: number
  pre_booked_only: boolean
  skipped: boolean
  predictions: Predictions
}

export interface Departure {
  scheduled: string
  actual?: string
  estimated: string
}

export interface Arrival {
  scheduled: string
  actual?: string
  estimated: string
}

export interface Location {
  id: number
  type: string
  name: string
  region_name: string
  code: string
  code_detail: string
  detailed_name: string
  lon: number
  lat: number
  google_place_id: string
  atco_code: string
  timezone: string
  zone: Zone[]
  heading: number
  direction?: string
}

export interface Zone {
  latitude: number
  longitude: number
}

export interface Predictions {
  state_of_charge: number
}

export interface Vehicle {
  wheelchair: number
  seat: number
  bicycle: number
  id: number
  plate_number: string
  name: string
  has_wifi: boolean
  has_toilet: boolean
  type: string
  brand: string
  colour: string
  is_backup_vehicle: boolean
  owner_id: number
  gps: Gps
  secondary_gps: Gps | undefined
}

export interface Gps {
  last_updated: string
  longitude: number
  latitude: number
  heading: number
}

export interface Description {
  route_number: string
  pattern_id: number
  calendar_date: string
  type: string
  is_cancelled: boolean
  route_id: number
}
