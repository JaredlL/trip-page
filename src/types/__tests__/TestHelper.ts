import type { RouteStop, Vehicle } from '../RouteData'

export function createRouteStop(): RouteStop {
  return {
    id: 917238,
    departure: {
      scheduled: '2024-03-26T21:08:00+00:00',
      actual: '2024-03-26T21:08:01+00:00',
      estimated: '2024-03-26T21:08:00+00:00'
    },
    arrival: {
      scheduled: '2024-03-26T21:08:00+00:00',
      actual: '2024-03-26T20:53:10+00:00',
      estimated: '2024-03-26T21:08:00+00:00'
    },
    location: {
      id: 66,
      type: 'STOP_POINT',
      name: 'Buchanan Bus Stn (Stance 53)',
      region_name: 'Glasgow',
      code: 'GLA',
      code_detail: 'Buchanan Bus Stn',
      detailed_name: 'Buchanan Bus Station (Stance 53)',
      lon: -4.25172,
      lat: 55.86539,
      google_place_id: 'ChIJeda6eB9EiEgRnGBh2eKH5bE',
      atco_code: '60903769',
      timezone: 'Europe/London',
      zone: [
        {
          latitude: 55.86505687527126,
          longitude: -4.252324939447394
        },
        {
          latitude: 55.86484990290668,
          longitude: -4.249005387522362
        },
        {
          latitude: 55.8654235093243,
          longitude: -4.248731392760296
        },
        {
          latitude: 55.86570143928429,
          longitude: -4.252156327286123
        },
        {
          latitude: 55.86505687527126,
          longitude: -4.252324939447394
        }
      ],
      heading: 270
    },
    allow_boarding: true,
    allow_drop_off: false,
    booking_cut_off_mins: 0,
    pre_booked_only: false,
    skipped: false,
    predictions: {
      state_of_charge: 0.6348135454545455
    }
  }
}

export function createVehicle(): Vehicle {
  return {
    seat: 38,
    wheelchair: 1,
    bicycle: 2,
    id: 33,
    plate_number: 'SG23 ORX',
    name: 'Yutong Coach (SG23 ORX)',
    has_wifi: true,
    has_toilet: true,
    type: 'coach',
    brand: 'Yutong',
    colour: 'Black',
    is_backup_vehicle: false,
    owner_id: 1,
    gps: {
      last_updated: '2024-03-30T21:01:23+00:00',
      longitude: -3.97133,
      latitude: 56.14194,
      heading: 5
    },
    secondary_gps: {
      last_updated: '2024-03-30T21:01:24.929000+00:00',
      longitude: -3.971342096409118,
      latitude: 56.142433296504976,
      heading: 7.221601486206055
    }
  }
}
