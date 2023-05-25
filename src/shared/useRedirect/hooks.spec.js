import { renderHook } from '@testing-library/react'

import { useRedirect } from './hooks'

const href = `/account/gh/rula/billing`
describe('useRedirect', () => {
  let originalLocation

  beforeAll(() => {
    originalLocation = global.window.location
    delete global.window.location
    global.window.location = {
      replace: jest.fn(),
    }
  })

  afterAll(() => {
    jest.resetAllMocks()
    window.location = originalLocation
  })

  describe('When data is loaded', () => {
    it('location replace was called (redirected)', async () => {
      const { result } = renderHook(() => useRedirect({ href }))

      const { hardRedirect } = result?.current
      hardRedirect()

      expect(window.location.replace).toHaveBeenCalledTimes(1)
    })
  })
})
