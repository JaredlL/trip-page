<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'
import type { Quotes, Leg } from '@/types/Quotes.ts'

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
        const response = await axios.get<Quotes>(
          `https://api.ember.to/v1/quotes/?origin=${origin}&destination=${destination}&departure_date_from=${startOfToday}&departure_date_to=${endOfToday}`
        )

        // Filter for in-progress legs
        const newLegs = response.data.quotes
          .flatMap((quote) => quote.legs)
          .filter((leg) => leg.arrival.actual == null)
          .filter((leg) => leg.departure.actual)

        legs.value = [...legs.value, ...newLegs].sort(
          (a, b) =>
            new Date(a.departure.scheduled).getTime() - new Date(b.departure.scheduled).getTime()
        )
      } catch (error) {
        console.error('Error fetching quotes:', error)
      }
    }

    // 66 Glasgow
    // 72 Dundee
    // 13 Edinburgh
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
  <div class="quoteList">
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
.quoteList {
  padding: 0 1.5rem 0 1.5rem;
}

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
@/types/Quote
