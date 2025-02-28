import { renderHook, waitFor } from '@testing-library/react'

import config from 'config'

import { useBarecancel } from './useBarecancel'

const mocks = vi.hoisted(() => ({
  loadBaremetrics: vi.fn(),
  useParams: vi.fn(),
}))

vi.mock('services/toastNotification/context')

vi.mock('react-router-dom', async () => {
  const actual = await vi.requireActual('react-router-dom')
  return {
    ...actual, // import and retain the original functionalities
    useParams: mocks.useParams,
  }
})
vi.mock('services/account')

vi.mock('./utils', () => ({
  loadBaremetrics: mocks.loadBaremetrics,
}))

describe('useBarecancel', () => {
  describe('Initializes', () => {
    beforeEach(() => {
      window.barecancel = { params: null }
    })

    it('window params are set', async () => {
      mocks.loadBaremetrics.mockResolvedValue() // Mock successful load
      const callbackSend = () => {}
      const { result } = renderHook(() =>
        useBarecancel({ customerId: 1234, callbackSend, isModalOpen: true })
      )

      // start as blocked
      expect(result.current.baremetricsBlocked).toBe(true)

      const expectedParams = {
        access_token_id: config.BAREMETRICS_TOKEN,
        customer_oid: 1234,
        comment_required: true,
        callback_send: () => {
          callbackSend()
        },
        callback_error: (error) => {
          console.error(error)
        },
      }

      await waitFor(() =>
        expect(JSON.stringify(window.barecancel.params)).toEqual(
          JSON.stringify(expectedParams)
        )
      )

      // Check that it was not blocked
      expect(result.current.baremetricsBlocked).toBe(false)
    })

    it('returns blocked if load fails', async () => {
      mocks.loadBaremetrics.mockRejectedValueOnce()
      const callbackSend = vi.fn()
      const { result } = renderHook(() =>
        useBarecancel({ customerId: 1234, callbackSend, isModalOpen: true })
      )

      expect(result.current.baremetricsBlocked).toBe(true)
    })
  })

  describe('Cleans up', () => {
    it('Removes script and styles tag', () => {
      mocks.loadBaremetrics.mockResolvedValueOnce() // Mock successful load
      const callbackSend = vi.fn()
      renderHook(() =>
        useBarecancel({ customerId: 1234, callbackSend, isModalOpen: true })
      )

      expect(
        // eslint-disable-next-line
        document.querySelector(
          '[href="https://baremetrics-barecancel.baremetrics.com/css/barecancel.css"]'
        )
      ).not.toBeInTheDocument()

      expect(
        // eslint-disable-next-line
        document.querySelector('baremetrics-script')
      ).not.toBeInTheDocument()
    })
  })
})
