import { renderHook } from '@testing-library/react-hooks'

import config from 'config'

import { useBarecancel } from './hooks'
describe('useBarecancel', () => {
  function setup(customerId, callbackSend, callback_error) {
    renderHook(() =>
      useBarecancel({ customerId, callbackSend, callback_error })
    )
  }

  describe('Initializes', () => {
    beforeEach(() => {
      const customerId = 1234
      const callbackSend = () => {}
      const callback_error = () => {}
      setup(customerId, callbackSend, callback_error)
    })
    it('window params are set', () => {
      const expectedParams = {
        access_token_id: config.BAREMETRICS_TOKEN,
        customer_oid: 1234,
        comment_required: true,
        callback_send: () => {},
        callback_error: () => {},
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
