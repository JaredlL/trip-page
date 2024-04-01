<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, inject } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'
import type { DateNow } from '@/types/Clock.ts'
import { DateNowKey } from '../InjectionKeys'
import type { RouteData, RouteStop, Vehicle } from '@/types/RouteData.ts'
import { mostRecentGps, toMinutesString, hasVisitedOrSkipped } from '@/types/Util'
import TripMap from './TripMap.vue'
import pinSlashSvg from '@/assets/pin-slash.svg'
import pinSvg from '@/assets/pin.svg'
import config from '../config'

const dateNow = inject<DateNow>(DateNowKey, () => new Date())

const route = useRoute()
const tripId = route.params.tripUid
const routeData = ref<RouteData>()
const currentTime = ref(dateNow())
const focusItem = ref<RouteStop | Vehicle>()

const CancelToken = axios.CancelToken
const cancelTokenSource = CancelToken.source()

let fetchRouteDataId: ReturnType<typeof setInterval>
let currentTimeId: number

// Fetching of route data is performed periodically
// Prevent consecutive calls from overlapping (due to network delays or server response times)
// by tracking when a request is in progress. Additionally, this helps prevents a build up of requests
// overwhelming an already struggling server.
const isFetching = ref(false)
const fetchRouteData = async () => {
  if (isFetching.value) {
    console.log('Fetch in progress, skipping...')
    return
  }

  isFetching.value = true
  try {
    const tripsResponse = await axios.get<RouteData>(
      `${config.apiBaseUrl}/trips/${tripId}/?all=true`,
      {
        cancelToken: cancelTokenSource.token
      }
    )
    routeData.value = tripsResponse?.data
  } catch (error) {
    console.error('Error fetching trip:', error)
  } finally {
    isFetching.value = false
  }
}

onMounted(() => {
  fetchRouteData()
  // Update the Route Data periodically
  fetchRouteDataId = setInterval(fetchRouteData, config.tripRefreshIntervalSeconds * 1000)

  // Update current time every second
  currentTimeId = window.setInterval(() => {
    currentTime.value = dateNow()
  }, 1000)
})

// Ensure the polling stops when the component is no longer active
onUnmounted(() => {
  clearInterval(currentTimeId)
  clearInterval(fetchRouteDataId)

  // Cancel any in progress requests
  cancelTokenSource.cancel()
})

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
  return toMinutesString(routeStop.arrival.estimated)
}

function scheduledString(routeStop: RouteStop) {
  return toMinutesString(routeStop.arrival.scheduled)
}

function notVisitedOrSkipped(routeStop: RouteStop) {
  return !(routeStop.skipped || routeStop.departure.actual)
}

function setFocusItem(item: RouteStop | Vehicle | undefined) {
  const currentVal = focusItem?.value
  if (isVehicle(currentVal) && isVehicle(item)) {
    focusItem.value = undefined
  } else {
    focusItem.value = item
  }
}

function focusItemIsVehicle() {
  return (focusItem?.value as Vehicle)?.gps !== undefined
}

function isVehicle(item: RouteStop | Vehicle | undefined) {
  return (item as Vehicle)?.gps !== undefined
}

function getEstimatedTimeColor(routeStop: RouteStop) {
  const delaySeconds =
    (new Date(routeStop.arrival.estimated).getTime() -
      new Date(routeStop.arrival.scheduled).getTime()) /
    1000
  if (delaySeconds > 360) {
    return 'red'
  } else if (delaySeconds > 60) {
    return 'darkorange'
  } else {
    return 'green'
  }
}
</script>

<template>
  <div>
    <h1
      class="cancelled"
      :style="{ display: routeData?.description.is_cancelled ? 'inline' : 'none' }"
    >
      Alert - This trip has been cancelled
    </h1>
    <h1
      class="finished"
      :style="{
        display:
          routeData?.route.every((x) => hasVisitedOrSkipped(x)) &&
          !routeData?.description.is_cancelled
            ? 'inline'
            : 'none'
      }"
    >
      This trip has finished
    </h1>
    <div ref="mapContainer" class="map-container">
      <TripMap v-if="routeData" :routeData="routeData" :focusItem="focusItem" />
    </div>
    <div class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th></th>
            <th>Name</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr @click="setFocusItem(routeData?.vehicle)">
            <td class="icon">
              🚌
              <div class="arrow-container">
                <div class="arrow-tail"></div>
                <div class="arrow-down"></div>
              </div>
            </td>
            <td>
              <div>{{ routeData?.vehicle.name }}</div>
              <div>
                <!--Using emjos is convenient but presents a risk of inconsistent display on different browsers-->
                {{ routeData?.vehicle.has_toilet ? '🚻' : '' }}
                {{ routeData?.vehicle.has_wifi ? '🛜' : '' }}
              </div>
            </td>
            <td>
              <div class="vehicle-status">
                <div class="vehicle-status-left">
                  Last GPS update from bus: {{ lastUpdateString }} seconds ago ({{
                    routeData
                      ? new Date(
                          mostRecentGps(routeData?.vehicle).last_updated
                        ).toLocaleTimeString()
                      : ''
                  }})
                </div>
                <div class="vehicle-status-right">
                  <img :src="focusItemIsVehicle() ? pinSvg : pinSlashSvg" />
                </div>
              </div>
            </td>
          </tr>
          <tr
            v-for="(routeStop, index) in routeData?.route.filter(notVisitedOrSkipped)"
            :key="routeStop.id"
            @click="setFocusItem(routeStop)"
          >
            <td class="icon">
              🚏
              <div
                v-if="index < (routeData?.route?.filter(notVisitedOrSkipped)?.length ?? 0) - 1"
                class="arrow-container"
              >
                <div class="arrow-tail"></div>
                <div class="arrow-down"></div>
              </div>
            </td>
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
  color: red; /* Would be good to define and import from base.css */
}

.vehicle-status {
  display: flex;
  height: 100%;
}

.vehicle-status-left {
  width: 75%;
  height: 100%;
}

.vehicle-status-right {
  width: 25%;
  height: 100%;
}

.finished {
  font-weight: bold;
  color: green;
}

.estimated {
  font-weight: bold;
}

.scheduled {
  color: grey;
}

.icon {
  text-align: center;
}

.arrow-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.arrow-down {
  width: 0;
  height: 0;
  border-left: 4px solid transparent;
  border-right: 4px solid transparent;
  border-top: 10px solid hsla(160, 100%, 37%, 1);
}

.arrow-tail {
  width: 2px;
  height: 10px;
  background-color: hsla(160, 100%, 37%, 1);
}
</style>
