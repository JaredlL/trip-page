<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, inject } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'
import type { DateNow } from '@/types/Clock.ts'
import { DateNowKey } from '../InjectionKeys.ts'
import type { RouteData } from '@/types/RouteData.ts'
import TripMap from './TripMap.vue'

const dateNow = inject<DateNow>(DateNowKey, () => new Date())

const route = useRoute()
const tripId = route.params.tripUid
const routeData = ref<RouteData>()
const currentTime = ref(dateNow())

const fetchRouteData = async () => {
  try {
    const tripsResponse = await axios.get(`https://api.ember.to/v1/trips/${tripId}`)
    routeData.value = tripsResponse.data
  } catch (error) {
    console.error('Error fetching trip:', error)
  }
}

const coordinates = computed(() => {
  const mosRecentGps = mostRecentGps()
  if (mosRecentGps) {
    return {
      latitude: mosRecentGps.latitude,
      longitude: mosRecentGps.longitude
    }
  } else {
    return null
  }
})

const lastUpdateString = computed(() => {
  const mosRecentGps = mostRecentGps()
  if (mosRecentGps?.last_updated) {
    const timeDif = currentTime.value.getTime() - new Date(mosRecentGps.last_updated).getTime()
    const seconds = Math.trunc(timeDif / 1000)
    return seconds
  } else {
    return ''
  }
})

function mostRecentGps() {
  const vehicle = routeData.value?.vehicle
  if (!vehicle) return null
  if (!vehicle.secondary_gps) return vehicle.gps

  return new Date(vehicle.gps.last_updated) > new Date(vehicle.secondary_gps.last_updated)
    ? vehicle.gps
    : vehicle.secondary_gps
}

let fetchRouteDataId: ReturnType<typeof setInterval>
let currentTimeId: number

onMounted(() => {
  fetchRouteData()
  fetchRouteDataId = setInterval(fetchRouteData, 10000)

  // Update current time every second
  currentTimeId = window.setInterval(() => {
    currentTime.value = dateNow()
  }, 1000)
})

// Ensure the polling stops when the component is no longer active
onUnmounted(() => {
  if (fetchRouteDataId) {
    clearInterval(currentTimeId)
  }
  clearInterval(fetchRouteDataId)
})
</script>

<template>
  <div>
    <h2>Route Number: {{ routeData?.description.route_number }}</h2>
    <h2>BusId: {{ routeData?.vehicle.id }}</h2>
    <h2>Last GPS Update: {{ lastUpdateString }} seconds ago</h2>
    <TripMap v-if="coordinates" :coordinates="coordinates" />
  </div>
</template>

<style>
#app {
  text-align: center;
}
input {
  margin: 0 10px;
  text-align: center;
}
button {
  margin: 0 5px;
}
</style>
