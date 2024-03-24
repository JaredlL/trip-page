export interface RouteStop {
  id: number
  departure: ScheduledTime
  arrival: ScheduledTime
  location: Location
  allow_boarding: boolean
  allow_drop_off: boolean
  booking_cut_off_mins: number
  pre_booked_only: boolean
  skipped: boolean
}

export interface ScheduledTime {
  scheduled: string
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
  zone: Coordinate[]
  heading: number
  direction?: string // Optional since not all locations may have a direction
}

export interface Coordinate {
  latitude: number
  longitude: number
}

export interface Vehicle {
  seat: number
  wheelchair: number
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
  gps: GPS
  secondary_gps: GPS
}

export interface GPS {
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

export interface RouteData {
  route: RouteStop[]
  vehicle: Vehicle
  description: Description
}
