import { createRouter, createWebHistory } from 'vue-router'
import QuoteView from '@/views/QuoteView.vue'
import TripView from '@/views/TripView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: QuoteView
    },
    {
      path: '/trip/:tripUid',
      name: 'trip',
      component: TripView,
      props: true
    }
  ]
})

export default router
