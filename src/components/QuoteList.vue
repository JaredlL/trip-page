<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'
import type { RootQuoteObject, Leg } from '@/types/RootQuoteObject.ts'

export default defineComponent({
  name: 'QuotesTable',
  setup() {
    const legs = ref<Leg[]>([])
    const router = useRouter()
    const now = new Date()

    function getISO8601StartEndOfDay() {
      const startOfToday = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        0,
        0,
        0,
        0
      ).toISOString()

      const endOfToday = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        23,
        59,
        59,
        999
      ).toISOString()

      return { startOfToday, endOfToday }
    }

    async function fetchAndUpdateQuotes(origin: number, destination: number) {
      const { startOfToday, endOfToday } = getISO8601StartEndOfDay()
      try {
        const response = await axios.get<RootQuoteObject>(
          `https://api.ember.to/v1/quotes/?origin=${origin}&destination=${destination}&departure_date_from=${startOfToday}&departure_date_to=${endOfToday}`
        )
        const newLegs = response.data.quotes
          .flatMap((quote) => quote.legs)
          .filter((leg) => !leg.arrival.actual || new Date(leg.arrival.actual) > now)

        legs.value = [...legs.value, ...newLegs] // Merge and trigger reactivity
      } catch (error) {
        console.error('Error fetching quotes:', error)
      }
    }

    const fetchQuotes = async () => {
      const pairs = [
        { origin: 13, destination: 42 },
        { origin: 42, destination: 13 },
        { origin: 66, destination: 72 },
        { origin: 72, destination: 66 }
      ]
      pairs.forEach((pair) => fetchAndUpdateQuotes(pair.origin, pair.destination))
    }

    const navigate = (tripId: string) => {
      router.push(`/trip/${tripId}`)
    }

    onMounted(fetchQuotes)

    return { legs, navigate }
  }
})
</script>

<template>
  <div>
    <table>
      <thead>
        <tr>
          <th>Origin</th>
          <th>Destination</th>
          <th>Departure (scheduled)</th>
          <th>Arrival (scheduled)</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="leg in legs" :key="leg.trip_uid" @click="navigate(leg.trip_uid)">
          <td>{{ leg.origin.name }}, {{ leg.origin.region_name }}</td>
          <td>{{ leg.destination.name }}, {{ leg.destination.region_name }}</td>
          <td>{{ new Date(leg.departure.scheduled).toLocaleTimeString() }}</td>
          <td>{{ new Date(leg.arrival.scheduled).toLocaleTimeString() }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style>
table {
  width: 100%;
  border-collapse: collapse;
}
table,
th,
td {
  border: 1px solid var(--color-border);
}
th,
td {
  padding: 8px;
  text-align: left;
}
tbody tr:hover {
  background-color: var(--color-background-mute);
}
</style>
