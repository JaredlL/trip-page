import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as Test from '@vue/test-utils'
import TheTrip from '../TheTrip.vue'
import { createRouteData } from './TestHelper'
import config from '../../config'

const mocks = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn()
}))

const mockedTripId = 'mocked-trip-id'

vi.mock('vue-router', () => ({
  useRoute: vi.fn(() => ({
    params: { tripUid: mockedTripId }
  }))
}))

vi.mock('axios', async (importActual) => {
  const actual = await importActual<typeof import('axios')>()

  const mockAxios = {
    default: {
      ...actual.default,
      get: mocks.get,
      create: vi.fn(() => ({
        ...actual.default.create(),
        get: mocks.get,
        post: mocks.post
      }))
    }
  }

  return mockAxios
})

describe('TheTrip', () => {
  beforeEach(() => {
    // Reset mocks and timers before each test
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  it('fetches route data on mount', async () => {
    // [arrange]
    const mockRouteData = createRouteData()
    mocks.get.mockResolvedValue({
      data: mockRouteData
    })

    // [act]
    Test.shallowMount(TheTrip)

    // [assert]
    expect(mocks.get).toBeCalledTimes(1)
    expect(mocks.get).toBeCalledWith(
      expect.stringContaining(`/trips/${mockedTripId}/?all=true`),
      expect.objectContaining({
        cancelToken: expect.anything() // Just check that cancelToken is present
      })
    )
  })

  it('fetches route data periodically', async () => {
    // [arrange]
    const mockRouteData = createRouteData()
    mocks.get.mockResolvedValue({
      data: mockRouteData
    })

    Test.shallowMount(TheTrip)

    // [act]
    vi.advanceTimersByTime(config.tripRefreshIntervalSeconds * 1000)

    // [assert]
    expect(mocks.get).toHaveBeenCalledTimes(2)
  })

  // Other tests
  // - Intervals cleared onUnmounted, request cancelled
  // - Error responses
  // - Status strings display expected timings
  // - https://test-utils.vuejs.org/guide/advanced/component-instance.html
})
