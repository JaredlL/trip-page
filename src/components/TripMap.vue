<script lang="ts" setup>
import { onMounted, watch } from 'vue'
import type { RouteData, RouteStop, Vehicle } from '@/types/RouteData'
import { mostRecentGps, hasVisitedOrSkipped, stopVisitationContextString } from '@/types/Util'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import vehicleIconSvg from '@/assets/bus-icon.svg'
import gpsIconSvg from '@/assets/gps-icon.svg'

const props = defineProps<{
  routeData: RouteData
  focusItem: RouteStop | Vehicle | undefined
}>()

const vehicleIcon = L.icon({
  iconUrl: vehicleIconSvg,
  iconSize: [35, 45],
  iconAnchor: [17, 45],
  popupAnchor: [0, -28]
})

let map: L.Map | null = null
let vehicleMarker: L.Marker | null = null
let userMarker: L.Marker | null = null

// Reference added stop markers so that we can clear them on redraw
let stopMarkers: L.Marker[] = []

function customIcon(color: String) {
  return L.divIcon({
    className: 'custom-icon',
    html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 25 41" width="25" height="41"><path fill="${color}" stroke="#fff" stroke-width="1.5" d="M12.5 0C5.6 0 0 5.6 0 12.5 0 20.8 12.5 41 12.5 41S25 20.8 25 12.5C25 5.6 19.4 0 12.5 0z"/></svg>`,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34]
  })
}

onMounted(() => {
  const recentGps = mostRecentGps(props.routeData.vehicle)

  // Directly accessing the DOM is discouraged.
  // Investing getting leaflet working with ref is deserved -
  // https://vuejs.org/guide/essentials/template-refs#ref-on-component
  map = L.map('map').setView([recentGps.latitude, recentGps.longitude], 13)

  // https://wiki.openstreetmap.org/wiki/Raster_tile_providers
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution:
      'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map)

  updateVehicleMarker(props.routeData.vehicle)
  refreshStopMarkers(props.routeData, map)
})

function updateVehicleMarker(vehicle: Vehicle) {
  const recentGps = mostRecentGps(vehicle)
  if (vehicleMarker && map) {
    // If vehicle marker already exists, just set its new position
    vehicleMarker.setLatLng([recentGps.latitude, recentGps.longitude]).bindPopup(vehicle.name)
  } else if (map) {
    vehicleMarker = L.marker([recentGps.latitude, recentGps.longitude], { icon: vehicleIcon })
      .addTo(map)
      .bindPopup(vehicle.name)
  }
}

function refreshStopMarkers(routeData: RouteData, map: L.Map) {
  for (var stopmarker of stopMarkers) {
    // This unfortunatly means any open popups will be lost
    stopmarker.remove()
  }

  stopMarkers = []

  for (var stop of routeData.route) {
    const color = hasVisitedOrSkipped(stop) || stop.skipped ? 'grey' : 'green'
    const newMarker = L.marker([stop.location.lat, stop.location.lon], { icon: customIcon(color) })
      .addTo(map)
      .bindPopup(stopVisitationContextString(stop))
    stopMarkers.push(newMarker)
  }
}

// Watch for changes in route data and update markers
watch(
  () => props.routeData,
  (newVal) => {
    if (map) {
      updateVehicleMarker(newVal.vehicle)

      // Remove and redraw the stop markers each update.
      refreshStopMarkers(newVal, map)

      // If the focus item is the bus, follow it
      if (isVehicle(props.focusItem)) {
        const recentGps = mostRecentGps(props.routeData?.vehicle)
        map.flyTo([recentGps.latitude, recentGps.longitude], undefined, {
          animate: true,
          duration: 0.5
        })
      }
    }
  }
)

// Watch for triggers to zoom to focus item
watch(() => props.focusItem, flyToFocusItem)

function flyToFocusItem(focusItem: RouteStop | Vehicle | undefined) {
  if (map) {
    if (isVehicle(focusItem)) {
      const recentGps = mostRecentGps(props.routeData?.vehicle)
      map.flyTo([recentGps.latitude, recentGps.longitude], undefined, {
        animate: true,
        duration: 0.5
      })
    } else if (isRouteStop(focusItem)) {
      map.flyTo([focusItem.location.lat, focusItem.location.lon], undefined, {
        animate: true,
        duration: 0.5
      })
    }
  }
}

function isRouteStop(obj: any): obj is RouteStop {
  return (obj as RouteStop)?.location !== undefined
}

function isVehicle(obj: any): obj is Vehicle {
  return (obj as Vehicle)?.gps !== undefined
}

const displayUserLocation = () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (map) {
          updateUserMarker(map, position)
          map.setView([position.coords.latitude, position.coords.longitude], 15)
        }
      },
      () => {
        // It would be better to have a reusable app component for alerts
        alert('Unable to retrieve your location')
      }
    )
  } else {
    alert('Geolocation is not supported by your browser')
  }
}

function updateUserMarker(map: L.Map, position: GeolocationPosition) {
  if (userMarker && map) {
    // If marker already exists, just set its new position
    userMarker.setLatLng([position.coords.latitude, position.coords.longitude])
  } else if (map) {
    userMarker = L.marker([position.coords.latitude, position.coords.longitude], {
      icon: customIcon('pink')
    })
      .addTo(map)
      .bindPopup('Your location')
  }
}
</script>

<template>
  <div class="map-container">
    <div id="map"></div>
    <button class="user-location-button" @click="displayUserLocation">
      <img :src="gpsIconSvg" />
    </button>
  </div>
</template>

<style scoped>
.map-container {
  position: relative;
  height: 450px;
}

.user-location-button {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 400; /* Ensure it's above Leaflet's controls */
  padding: 5px 10px;
}

#map {
  height: 100%;
}
</style>
