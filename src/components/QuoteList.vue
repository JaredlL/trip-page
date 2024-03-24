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

    function getEndOfTodayISO8601(): string {
      const now = new Date()
      const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)
      return endOfToday.toISOString()
    }

    function getStartOfTodayISO8601(): string {
      const now = new Date()
      const endOfToday = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        0o0,
        0o0,
        0o0,
        0o00
      )
      return endOfToday.toISOString()
    }

    async function fetchQuote(origin: number, destination: number) {
      const startOfTodayISO = getStartOfTodayISO8601()
      const endOfTodayISO = getEndOfTodayISO8601()
      const response = await axios.get<RootQuoteObject>(
        `https://api.ember.to/v1/quotes/?origin=${origin}&destination=${destination}&departure_date_from=${startOfTodayISO}&departure_date_to=${endOfTodayISO}`
      )
      return response.data.quotes.flatMap((quote) => quote.legs)
    }

    const fetchQuotes = async () => {
      try {
        const pairs = [
          { origin: 13, destination: 42 },
          { origin: 42, destination: 13 },
          { origin: 66, destination: 72 },
          { origin: 72, destination: 66 }
        ]
        const now = new Date()
        const fetchPromises = pairs.map((pair) => fetchQuote(pair.origin, pair.destination))
        Promise.all(fetchPromises).then((results) => {
          legs.value = results
            .flat()
            // remove trips which have finished
            .filter((leg) => !leg.arrival.actual || new Date(leg.arrival.actual) > now)
        })
      } catch (error) {
        console.error('Error fetching quotes:', error)
      }
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
