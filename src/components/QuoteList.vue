<template>
  <div>
    <table>
      <thead>
        <tr>
          <th>Origin</th>
          <th>Destination</th>
          <th>Departure</th>
          <th>Arrival</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="leg in legs" :key="leg.trip_uid" @click="navigate(leg.trip_uid)">
          <td>{{ leg.origin.detailed_name }}</td>
          <td>{{ leg.destination.detailed_name }}</td>
          <td>{{ new Date(leg.departure.scheduled).toLocaleTimeString() }}</td>
          <td>{{ new Date(leg.arrival.scheduled).toLocaleTimeString() }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'
import type { RootQuoteObject, Leg } from '@/types/RootQuoteObject.ts'

export default defineComponent({
  name: 'QuotesTable',
  setup() {
    const rootObject = ref<RootQuoteObject>()
    const legs = ref<Leg[]>()

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

    const fetchQuotes = async () => {
      try {
        const startOfTodayISO = getStartOfTodayISO8601()
        const endOfTodayISO = getEndOfTodayISO8601()
        const response = await axios.get(
          `https://api.ember.to/v1/quotes/?origin=13&destination=42&departure_date_from=${startOfTodayISO}&departure_date_to=${endOfTodayISO}`
        )
        rootObject.value = response.data
        legs.value = rootObject.value?.quotes.flatMap((x) => x.legs)
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
