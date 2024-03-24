export interface Quote {
  availability: Availability
  prices: Prices
  legs: Leg[]
  bookable: boolean
}

export interface Availability {
  seat: number
  wheelchair: number
  bicycle: number
}

export interface Prices {
  adult: number
  child: number
  young_child: number
  concession: number
  seat: number
  wheelchair: number
  bicycle: number
}

export interface Leg {
  type: string
  trip_uid: string
  adds_capacity_for_trip_uid: null | string
  origin: Location
  destination: Location
  departure: DepartureArrivalTime
  arrival: DepartureArrivalTime
  description: Description
  trip_type: string
}

export interface Location {
  id: number
  atco_code: string
  detailed_name: string
  google_place_id: string
  lat: number
  lon: number
  name: string
  region_name: string
  type: string
  code: string
  code_detail: string
  timezone: string
  heading: number
  zone: Zone[]
  area_id: number
  location_time_id: number
  booking_cut_off_mins: number
  pre_booked_only: boolean
  skipped: boolean
  bookable: string
}

export interface Zone {
  longitude: number
  latitude: number
}

export interface DepartureArrivalTime {
  scheduled: Date
  actual?: Date
  estimated?: Date
}

export interface Description {
  operator: string
  destination_board: string
  number_plate: string
  vehicle_type: string
  colour: string
  amenities: Amenities
}

export interface Amenities {
  has_wifi: boolean
  has_toilet: boolean
}

export interface RootQuoteObject {
  quotes: Quote[]
  min_card_transaction: number
}
