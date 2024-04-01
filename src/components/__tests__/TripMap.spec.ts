import { describe, it, expect, vi } from 'vitest'
import * as Test from '@vue/test-utils'
import TripMap from '../TripMap.vue'
import { createRouteData } from './TestHelper'

const markerMocks = vi.hoisted(() => ({
  addTo: vi.fn().mockReturnThis(),
  bindPopup: vi.fn().mockReturnThis(),
  setLatLng: vi.fn().mockReturnThis(),
  remove: vi.fn().mockReturnThis()
}))

vi.mock('leaflet', () => ({
  default: {
    map: vi.fn().mockReturnThis(),
    tileLayer: vi.fn().mockReturnThis(),
    addTo: vi.fn().mockReturnThis(),
    setView: vi.fn().mockReturnThis(),
    icon: vi.fn().mockReturnThis(),
    divIcon: vi.fn().mockReturnThis(),
    marker: vi.fn().mockImplementation(() => ({
      addTo: markerMocks.addTo,
      bindPopup: markerMocks.bindPopup,
      setLatLng: markerMocks.setLatLng,
      remove: markerMocks.remove
    }))
  }
}))

describe('TripMap', () => {
  it('adds markers for stops', async () => {
    // [arrange]
    const routeData = createRouteData()

    // [act]
    Test.mount(TripMap, {
      props: {
        routeData: routeData,
        focusItem: undefined
      }
    })

    // [assert]
    // 13 stops
    for (const stop of routeData.route) {
      expect(markerMocks.bindPopup).toBeCalledWith(expect.stringContaining(stop.location.name))
    }
  })

  it('adds marker for the bus', async () => {
    // [arrange]
    const routeData = createRouteData()

    // [act]
    Test.mount(TripMap, {
      props: {
        routeData: routeData,
        focusItem: undefined
      }
    })
    // [assert]
    expect(markerMocks.bindPopup).toBeCalledWith(expect.stringContaining(routeData.vehicle.name))
  })

  it('removes markers when props update', async () => {
    // [arrange]
    const routeData = createRouteData()
    const wrapper = Test.mount(TripMap, {
      props: {
        routeData: routeData,
        focusItem: undefined
      }
    })

    const updatedRouteData = createRouteData()
    updatedRouteData.route = []

    // [act]
    await wrapper.setProps({ routeData: updatedRouteData })

    // [assert]
    expect(markerMocks.remove).toBeCalledTimes(13)
  })

  // TODO add tests for focusing on items...
})
