import { renderHook } from '@testing-library/react-hooks'

import config from 'config'

import { useBarecancel } from './useBarecancel'
jest.mock('services/toastNotification')

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'), // import and retain the original functionalities
  useParams: jest.fn(() => {}),
}))
jest.mock('services/account')

describe('useBarecancel', () => {
  function setup(customerId, callbackSend) {
    renderHook(() => useBarecancel({ customerId, callbackSend }))
  }

  describe('Initializes', () => {
    const callbackSend = () => {}
    beforeEach(() => {
      const customerId = 1234
      setup(customerId, callbackSend)
    })
    it('window params are set', () => {
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
      expect(JSON.stringify(window.barecancel.params)).toEqual(
        JSON.stringify(expectedParams)
      )
    })
  })

  // describe('Cleans up', () => {
  //   const customCallback = jest.fn()
  //   beforeEach(() => {
  //     const customerId = 1234
  //     const callbackSend = () => {}
  //     const callback_error = () => {}
  //     setup(customerId, callbackSend, callback_error)
  //   })

  //   it('Removes script tag', () => {
  //     customCallback()
  //     expect(
  //       document.getElementById('baremetrics-script')
  //     ).not.toBeInTheDocument()
  //   })
  // })
})
