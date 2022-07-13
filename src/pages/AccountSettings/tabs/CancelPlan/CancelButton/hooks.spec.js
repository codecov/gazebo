import { renderHook, screen } from '@testing-library/react-hooks'

import config from 'config'

import { useBarecancel } from './hooks'

describe('useBarecancel', () => {
  function setup(accountDetails, callback) {
    renderHook(() => useBarecancel(accountDetails, callback))
  }

  describe('Initializes', () => {
    beforeEach(() => {
      setup({ subscriptionDetail: { customer: 1234 } }, () => {})
    })
    it('creates the script tag', () => {
      expect(screen.getByTestId('baremetrics-script')).toBeInTheDocument()
    })
    it('window params are set', () => {
      expect(window.barecancel.params).toEqual({
        access_token_id: config.BAREMETRICS_TOKEN,
        customer_oid: 1234,
        comment_required: true,
        test_mode: true,
        callback_send: () => {},
      })
    })
  })

  describe('Cleans up', () => {
    const customCallback = jest.fn()
    beforeEach(() => {
      setup({ subscriptionDetail: { customer: 1234 } }, customCallback)
    })
    it('Removes script tag', () => {
      customCallback()
      expect(screen.queryByTestId('baremetrics-script')).not.toBeInTheDocument()
    })
  })
})
