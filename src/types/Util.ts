import type { Gps, Vehicle, RouteStop } from './RouteData'

export function mostRecentGps(vehicle: Vehicle): Gps {
  if (!vehicle.secondary_gps) return vehicle.gps

  return new Date(vehicle.gps.last_updated) > new Date(vehicle.secondary_gps.last_updated)
    ? vehicle.gps
    : vehicle.secondary_gps
}

export function hasVisitedOrSkipped(routeStop: RouteStop): boolean {
  return routeStop.departure.actual != null || routeStop.skipped
}

export function nextStop(routeStop: RouteStop): boolean {
  return routeStop.departure.actual != null
}

export function stopVisitationContextString(routeStop: RouteStop): string {
  const scheduledString = new Date(routeStop.arrival.scheduled).toLocaleTimeString()
  const estimatedString = new Date(routeStop.arrival.estimated).toLocaleTimeString()
  const departedString = routeStop.departure.actual
    ? new Date(routeStop.departure.actual).toLocaleTimeString()
    : ''
  const locationName = routeStop.location.name

  if (routeStop.skipped) {
    return `${locationName}<br>Skipped`
  } else if (routeStop.departure.actual != null) {
    return `${locationName}<br>Departed: ${departedString}`
  } else {
    return `${routeStop.location.name}<br>Scheduled: ${scheduledString}<br>Estimated: ${estimatedString}`
  }
}
