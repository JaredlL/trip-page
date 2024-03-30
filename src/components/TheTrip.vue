<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, inject } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'
import type { DateNow } from '@/types/Clock.ts'
import { DateNowKey } from '../InjectionKeys'
import type { RouteData, RouteStop } from '@/types/RouteData.ts'
import { mostRecentGps } from '@/types/Util'
import TripMap from './TripMap.vue'

const dateNow = inject<DateNow>(DateNowKey, () => new Date())
const route = useRoute()
const tripId = route.params.tripUid
const routeData = ref<RouteData>()
const currentTime = ref(dateNow())

const fetchRouteData = async () => {
  try {
    const tripsResponse = await axios.get<RouteData>(
      `https://api.ember.to/v1/trips/${tripId}/?all=true`
    )
    routeData.value = tripsResponse.data
  } catch (error) {
    console.error('Error fetching trip:', error)
  }
}

const lastUpdateString = computed(() => {
  const mosRecentGps = routeData.value?.vehicle ? mostRecentGps(routeData.value.vehicle) : null
  if (mosRecentGps?.last_updated) {
    const timeDif = currentTime.value.getTime() - new Date(mosRecentGps.last_updated).getTime()
    const seconds = Math.trunc(timeDif / 1000)
    return seconds
  } else {
    return ''
  }
})

function estimatedString(routeStop: RouteStop) {
  return new Date(routeStop.arrival.estimated).toLocaleTimeString()
}

function scheduledString(routeStop: RouteStop) {
  return new Date(routeStop.arrival.scheduled).toLocaleTimeString()
}

function notVisitedOrSkipped(routeStop: RouteStop) {
  return !(routeStop.skipped || routeStop.departure.actual)
}

function getEstimatedTimeColor(routeStop: RouteStop) {
  const delaySeconds =
    (new Date(routeStop.arrival.estimated).getTime() -
      new Date(routeStop.arrival.scheduled).getTime()) /
    1000
  if (delaySeconds > 360) {
    return 'red'
  } else if (delaySeconds > 0) {
    return 'darkorange'
  } else {
    return 'green'
  }
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
    <h1
      class="cancelled"
      :style="{ display: routeData?.description.is_cancelled ? 'inline' : 'none' }"
    >
      Alert - This trip has been cancelled
    </h1>
    <div ref="mapContainer" class="map-container">
      <TripMap v-if="routeData" :routeData="routeData" />
    </div>
    <div class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{{ routeData?.vehicle.name }} &#128652;</td>
            <td>
              <div>Last GPS Update from bus: {{ lastUpdateString }} seconds ago</div>
              <div>
                {{ routeData?.vehicle.has_toilet ? '&#128699;' : '' }}
                {{ routeData?.vehicle.has_wifi ? '&#128732;' : '' }}
              </div>
            </td>
          </tr>
          <tr v-for="routeStop in routeData?.route.filter(notVisitedOrSkipped)" :key="routeStop.id">
            <td>{{ routeStop.location.name }}</td>
            <td>
              <div class="estimated" :style="{ color: getEstimatedTimeColor(routeStop) }">
                Estimated: {{ estimatedString(routeStop) }}
              </div>
              <div class="scheduled">Scheduled: {{ scheduledString(routeStop) }}</div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style>
#app {
  text-align: center;
}

.cancelled {
  font-weight: bold;
  color: red;
}

.estimated {
  font-weight: bold;
}

.scheduled {
  color: grey;
}
</style>
