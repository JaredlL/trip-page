<script lang="ts" setup>
import { onMounted } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import busIconSvg from '@/assets/bus-icon.svg'

const props = defineProps<{
  coordinates: { latitude?: number; longitude?: number }
}>()

onMounted(() => {
  const latitude = props.coordinates.latitude
  const longitude = props.coordinates.longitude
  console.log(`Got coordinates for vehicle: ${latitude} ${longitude}`)

  const map: L.Map = L.map('map').setView([latitude ?? 56.462, longitude ?? -2.9707], 13) // Default to Dundee

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution:
      'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map)

  // Define a custom icon
  const busIcon = L.icon({
    iconUrl: busIconSvg, // Adjust the path based on where your image is located
    iconSize: [35, 45], // Size of the icon
    iconAnchor: [17, 22], // Point of the icon which will correspond to marker's location
    popupAnchor: [0, -28] // Point from which the popup should open relative to the iconAnchor
  })

  // Add a marker at the specified coordinates
  if (props.coordinates.latitude && props.coordinates.longitude) {
    L.marker([props.coordinates.latitude, props.coordinates.longitude], { icon: busIcon }).addTo(
      map
    )
  }
})
</script>

<template>
  <div id="map" style="height: 400px"></div>
</template>
