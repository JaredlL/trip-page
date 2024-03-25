<script lang="ts" setup>
import { onMounted, watch, ref } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import busIconSvg from '@/assets/bus-icon.svg'

const props = defineProps<{
  coordinates: { latitude?: number; longitude?: number }
}>()

let map: L.Map | null = null
let marker: L.Marker | null = null
const followBus = ref(true)
const followButtonText = ref('Unfollow Bus')

const busIcon = L.icon({
  iconUrl: busIconSvg,
  iconSize: [35, 45],
  iconAnchor: [17, 45],
  popupAnchor: [0, -28]
})

onMounted(() => {
  // Default to Dundee if undefined
  const latitude = props.coordinates.latitude ?? 56.462
  const longitude = props.coordinates.longitude ?? -2.9707

  map = L.map('map').setView([latitude, longitude], 13)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution:
      'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map)

  updateMarker(latitude, longitude)
})

function updateMarker(latitude: number, longitude: number) {
  if (marker && map) {
    // If marker already exists, just set its new position
    marker.setLatLng([latitude, longitude])
  } else if (map) {
    // Create a new marker if it doesn't exist and add it to the map
    marker = L.marker([latitude, longitude], { icon: busIcon }).addTo(map)
  }
}

// Watch for changes in coordinates and update the map and marker accordingly
watch(
  () => props.coordinates,
  (newVal) => {
    console.log(
      `${new Date().toLocaleTimeString()} Got new coordinates for vehicle: ${newVal.latitude} ${newVal.longitude}`
    )
    if (newVal && newVal.latitude && newVal.longitude) {
      if (map && followBus.value) {
        map.setView([newVal.latitude, newVal.longitude], map.getZoom())
      }
      updateMarker(newVal.latitude, newVal.longitude)
    }
  },
  { deep: true }
)

// Function to toggle following the bus
function toggleFollowBus() {
  followBus.value = !followBus.value
  followButtonText.value = followBus.value ? 'Unfollow Bus' : 'Follow Bus'
  const lat = props.coordinates.latitude
  const long = props.coordinates.longitude
  if (followBus.value && lat && long) {
    map?.setView([lat, long], map.getZoom())
  }
}

const zoomToUserLocation = () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (map) {
          map.setView([position.coords.latitude, position.coords.longitude], 16) // Zoom to user location with zoom level 16
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
    <div id="map" style="height: 400px"></div>
    <button class="follow-button" @click="toggleFollowBus">{{ followButtonText }}</button>
    <button class="user-location-button" @click="zoomToUserLocation">Go to user</button>
  </div>
</template>

<style scoped>
.map-container {
  position: relative;
  height: 400px;
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
