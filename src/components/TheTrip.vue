<script lang="ts">
import { defineComponent, ref, onMounted, onUnmounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'
import type { RouteData } from '@/types/RouteData.ts'
import TripMap from './TripMap.vue'

export default defineComponent({
  name: 'App',
  components: {
    TripMap
  },
  setup() {
    const route = useRoute()
    const tripId = route.params.tripUid
    const routeData = ref<RouteData>()
    const currentTime = ref(new Date())

    const fetchRouteData = async () => {
      try {
        const tripsResponse = await axios.get(`https://api.ember.to/v1/trips/${tripId}`)
        routeData.value = tripsResponse.data
      } catch (error) {
        console.error('Error fetching trip:', error)
      }
    }

    const coordinates = computed(() => {
      if (routeData.value?.vehicle) {
        if (
          routeData.value.vehicle.secondary_gps == null ||
          new Date(routeData.value.vehicle.gps.last_updated) >
            new Date(routeData.value.vehicle.secondary_gps.last_updated)
        ) {
          return {
            latitude:
              routeData.value.vehicle.gps.latitude ??
              routeData.value.vehicle.secondary_gps.latitude,
            longitude:
              routeData.value?.vehicle.gps.longitude ??
              routeData.value?.vehicle.secondary_gps.longitude
          }
        } else {
          return {
            latitude:
              routeData.value.vehicle.gps.latitude ??
              routeData.value.vehicle.secondary_gps.latitude,
            longitude:
              routeData.value.vehicle.gps.longitude ??
              routeData.value.vehicle.secondary_gps.longitude
          }
        }
      } else {
        return null
      }
    })

    const lastUpdateString = computed(() => {
      if (routeData.value?.vehicle.gps.last_updated) {
        const timeDif =
          currentTime.value.getTime() - new Date(routeData.value.vehicle.gps.last_updated).getTime()
        const seconds = Math.trunc(timeDif / 1000)
        return seconds
      } else {
        return ''
      }
    })

    let fetchRouteDataId: NodeJS.Timeout | undefined
    let currentTimeId: number
    onMounted(() => {
      fetchRouteData()
      fetchRouteDataId = setInterval(fetchRouteData, 10000)

      // Update current time every second
      currentTimeId = window.setInterval(() => {
        currentTime.value = new Date()
      }, 1000)
    })

    // Ensure the polling stops when the component is no longer active
    onUnmounted(() => {
      if (fetchRouteDataId) clearInterval(fetchRouteDataId)
      clearInterval(currentTimeId) // Clear the interval updating the current time
    })

    return { routeData, coordinates, lastUpdateString }
  }
})
</script>

<template>
  <div>
    <h2>Route Number: {{ routeData?.description.route_number }}</h2>
    <h2>BusId: {{ routeData?.vehicle.id }}</h2>
    <h2>Last GPS Update: {{ lastUpdateString }} seconds ago</h2>
    <TripMap
      v-if="coordinates"
      :coordinates="coordinates"
      :key="`${coordinates.latitude}-${coordinates.longitude}`"
    />
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
