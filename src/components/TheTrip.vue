<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'
import type { RouteData } from '@/types/RouteData.ts'
import TripMap from './TripMap.vue'

export default defineComponent({
  name: 'App',
  components: {
    TripMap // This registers the TripMap component
  },
  setup() {
    const route = useRoute()
    const tripId = route.params.tripUid
    const routeData = ref<RouteData>()

    const fetchRouteData = async () => {
      try {
        const tripsResponse = await axios.get(`https://api.ember.to/v1/trips/${tripId}`)
        routeData.value = tripsResponse.data
      } catch (error) {
        console.error('Error fetching posts:', error)
      }
    }

    onMounted(fetchRouteData)

    return { routeData }
  }
})
</script>

<template>
  <div>
    <h2>Route Number: {{ routeData?.description.route_number }}</h2>
    <h2>BusId: {{ routeData?.vehicle.id }}</h2>
    <h2>Location: {{ routeData?.vehicle.gps.latitude }} {{ routeData?.vehicle.gps.longitude }}</h2>
    <h2>LastUpdated: {{ routeData?.vehicle.gps.last_updated }}</h2>
    <TripMap />
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
