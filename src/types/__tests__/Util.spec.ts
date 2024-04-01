import { describe, it, expect } from 'vitest'
import {
  hasVisitedOrSkipped,
  mostRecentGps,
  stopVisitationContextString,
  toMinutesString
} from '../Util'
import { createRouteStop, createVehicle } from './TestHelper'
import { Mock } from 'typemoq'
import type { IMock } from 'typemoq'
import type { RouteStop, Location } from '../RouteData'

describe(hasVisitedOrSkipped.name, () => {
  it('returns true if the stop has been visited', () => {
    // [arrange]
    const routeStop = createRouteStop()

    // [act]
    const result = hasVisitedOrSkipped(routeStop)

    // [assert]
    expect(result).toBe(true)
  })

  it('returns false if the stop has not yet been visited', () => {
    // [arrange]
    const routeStop = createRouteStop()
    routeStop.departure.actual = undefined

    // [act]
    const result = hasVisitedOrSkipped(routeStop)

    // [assert]
    expect(result).toBe(false)
  })

  it('returns true if the stop was skipped', () => {
    // [arrange]
    const routeStop = createRouteStop()
    routeStop.skipped = true

    // [act]
    const result = hasVisitedOrSkipped(routeStop)

    // [assert]
    expect(result).toBe(true)
  })
})

describe(mostRecentGps.name, () => {
  it('returns the primary if secondary is undefined', () => {
    // [arrange]
    const vehicle = createVehicle()
    vehicle.secondary_gps = undefined

    // [act]
    const result = mostRecentGps(vehicle)

    // [assert]
    expect(result).toEqual(vehicle.gps)
  })

  it('returns the seconday if it was updated more recently', () => {
    // [arrange]
    const vehicle = createVehicle()

    // [act]
    const result = mostRecentGps(vehicle)

    // [assert]
    expect(result).toEqual(vehicle.secondary_gps)
  })
})

describe(stopVisitationContextString.name, () => {
  it('returns an indication that a stop was skipped', () => {
    // [arrange]
    // Test using typemoq this time
    const locationName = 'testLocationName'

    const mockLocation: IMock<Location> = Mock.ofType<Location>()
    mockLocation.setup((x) => x.name).returns(() => locationName)

    const mockStop: IMock<RouteStop> = Mock.ofType<RouteStop>()
    mockStop.setup((x) => x.location).returns(() => mockLocation.object)
    mockStop.setup((x) => x.skipped).returns(() => true)

    // [act]
    const result = stopVisitationContextString(mockStop.object)

    // [assert]
    expect(result).toEqual(`${locationName}<br>Skipped`)
  })

  it('returns indication that a stop was departed', () => {
    // [arrange]
    const stop = createRouteStop()
    const locationName = stop.location.name

    // [act]
    const result = stopVisitationContextString(stop)

    // [assert]
    expect(result).contains(`${locationName}<br>Departed:`)
  })

  it('returns indication that a stop will be visited with an estimated and scheduled time', () => {
    // [arrange]
    const stop = createRouteStop()
    const locationName = stop.location.name
    stop.departure.actual = undefined

    // [act]
    const result = stopVisitationContextString(stop)

    // [assert]
    expect(result).contains(`${locationName}<br>Estimated:`)
    expect(result).contains(`<br>Scheduled:`)
  })
})

describe(toMinutesString.name, () => {
  it('returns a formated string representing the time to the nearest minute', () => {
    // [arrange]
    const stop = createRouteStop()

    // [act]
    const result = toMinutesString(stop.arrival.estimated)

    // [assert]
    expect(result).toEqual('09:08 PM')
  })
})
