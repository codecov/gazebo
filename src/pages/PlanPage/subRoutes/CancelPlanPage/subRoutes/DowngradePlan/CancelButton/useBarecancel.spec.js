import { renderHook, waitFor } from '@testing-library/react'

import config from 'config'

import { useBarecancel } from './useBarecancel'
jest.mock('services/toastNotification')

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'), // import and retain the original functionalities
  useParams: jest.fn(() => {}),
}))
jest.mock('services/account')

describe('useBarecancel', () => {
  describe('Initializes', () => {
    it('window params are set', async () => {
      const callbackSend = () => {}
      renderHook(() =>
        useBarecancel({ customerId: 1234, callbackSend, isModalOpen: true })
      )

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
    })
  })

  describe('Cleans up', () => {
    it('Removes script and styles tag', () => {
      const callbackSend = () => {}
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
