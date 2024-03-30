<script lang="ts" setup>
import { onMounted, watch, ref } from 'vue'
import type { RouteData } from '@/types/RouteData.ts'
import { mostRecentGps, hasVisitedOrSkipped, stopVisitationContextString } from '@/types/Util'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import busIconSvg from '@/assets/bus-icon.svg'

const props = defineProps<{
  routeData: RouteData
}>()

const followBus = ref(true)
const followButtonText = ref('Unfollow Bus')
const busIcon = L.icon({
  iconUrl: busIconSvg,
  iconSize: [35, 45],
  iconAnchor: [17, 45],
  popupAnchor: [0, -28]
})

let map: L.Map | null = null
let busMarker: L.Marker | null = null

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
  // Default to Dundee if undefined
  const latitude = props.routeData.vehicle.gps.latitude ?? 56.462
  const longitude = props.routeData.vehicle.gps.longitude ?? -2.9707

  map = L.map('map').setView([latitude, longitude], 13)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution:
      'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map)

  updateBusMarker(latitude, longitude)
  addStopMarkers(props.routeData, map)
})

function updateBusMarker(latitude: number, longitude: number) {
  if (busMarker && map) {
    // If marker already exists, just set its new position
    busMarker.setLatLng([latitude, longitude])
  } else if (map) {
    busMarker = L.marker([latitude, longitude], { icon: busIcon }).addTo(map)
  }
}

function addStopMarkers(routeData: RouteData, map: L.Map) {
  for (var stopmarker of stopMarkers) {
    stopmarker.remove()
  }

  stopMarkers = []

  for (var stop of routeData.route) {
    const color = hasVisitedOrSkipped(stop) || stop.skipped ? 'grey' : 'green'
    L.marker([stop.location.lat, stop.location.lon], { icon: customIcon(color) })
      .addTo(map)
      .bindPopup(stopVisitationContextString(stop))
  }
}

// Watch for changes in route data and update markers
watch(
  () => props.routeData,
  (newVal) => {
    const gps = mostRecentGps(newVal.vehicle)
    if (map) {
      if (followBus.value) {
        map.setView([gps.latitude, gps.longitude])
      }

      updateBusMarker(gps.latitude, gps.longitude)

      // Remove and redraw the stop markers each update.
      addStopMarkers(newVal, map)
    }
  },
  { deep: true }
)

// Function to toggle following the bus
function toggleFollowBus() {
  followBus.value = !followBus.value
  followButtonText.value = followBus.value ? 'Unfollow Bus' : 'Follow Bus'
  const gps = mostRecentGps(props.routeData.vehicle)
  const lat = gps.latitude
  const long = gps.longitude
  if (followBus.value) {
    map?.setView([lat, long], map.getZoom())
  }
}

const zoomToUserLocation = () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (map) {
          map.setView([position.coords.latitude, position.coords.longitude], 15)
        }
      },
      () => {
        alert('Unable to retrieve your location')
      }
    )
  } else {
    alert('Geolocation is not supported by your browser')
  }
}
</script>

<template>
  <div class="map-container">
    <div id="map"></div>
    <button class="follow-button" @click="toggleFollowBus">{{ followButtonText }}</button>
    <button class="user-location-button" @click="zoomToUserLocation">My location</button>
  </div>
</template>

<style scoped>
.map-container {
  position: relative;
  height: 450px;
}

.follow-button {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 400; /* Ensure it's above Leaflet's controls */
  padding: 5px 10px;
}

.user-location-button {
  position: absolute;
  top: 50px;
  right: 10px;
  z-index: 400; /* Ensure it's above Leaflet's controls */
  padding: 5px 10px;
}

#map {
  height: 100%;
}
</style>
