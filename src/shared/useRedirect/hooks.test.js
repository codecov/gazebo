import { renderHook } from '@testing-library/react'

import { useRedirect } from './hooks'

const href = `/account/gh/test-user/billing`
describe('useRedirect', () => {
  let originalLocation

  beforeAll(() => {
    originalLocation = global.window.location
    delete global.window.location
    global.window.location = {
      replace: vi.fn(),
    }
  })

  afterAll(() => {
    vi.resetAllMocks()
    window.location = originalLocation
  })

  describe('When data is loaded', () => {
    it('location replace was called (redirected)', async () => {
      const { result } = renderHook(() => useRedirect({ href }))

      result?.current?.hardRedirect()

      expect(window.location.replace).toHaveBeenCalledTimes(1)
    })
  })
})
