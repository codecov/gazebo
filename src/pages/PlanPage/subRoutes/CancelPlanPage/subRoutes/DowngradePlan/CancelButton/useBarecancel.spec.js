import { renderHook, waitFor } from '@testing-library/react'

import config from 'config'

import { useBarecancel } from './useBarecancel'
import { loadBaremetrics } from './utils'
jest.mock('services/toastNotification')

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'), // import and retain the original functionalities
  useParams: jest.fn(() => {}),
}))
jest.mock('services/account')

jest.mock('./utils', () => ({
  loadBaremetrics: jest.fn(),
}))

describe('useBarecancel', () => {
  describe('Initializes', () => {
    beforeEach(() => {
      window.barecancel = { params: null }
    })

    it('window params are set', async () => {
      loadBaremetrics.mockResolvedValue() // Mock successful load
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
      loadBaremetrics.mockRejectedValueOnce()
      const callbackSend = jest.fn()
      const { result } = renderHook(() =>
        useBarecancel({ customerId: 1234, callbackSend, isModalOpen: true })
      )

      expect(result.current.baremetricsBlocked).toBe(true)
    })
  })

  describe('Cleans up', () => {
    it('Removes script and styles tag', () => {
      loadBaremetrics.mockResolvedValueOnce() // Mock successful load
      const callbackSend = jest.fn()
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
