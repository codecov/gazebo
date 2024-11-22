import { renderHook } from '@testing-library/react'

import { useRedirect } from './hooks'

const href = `/account/gh/test-user/billing`
describe('useRedirect', () => {
  let originalLocation: Location

  beforeAll(() => {
    originalLocation = global.window.location
    Object.defineProperty(global.window, 'location', {
      configurable: true,
      enumerable: true,
      value: {
        replace: vi.fn(),
      },
    })
  })

  afterAll(() => {
    vi.resetAllMocks()
    Object.defineProperty(global.window, 'location', {
      configurable: true,
      enumerable: true,
      value: originalLocation,
    })
  })

  describe('When data is loaded', () => {
    it('location replace was called (redirected)', async () => {
      const { result } = renderHook(() => useRedirect({ href }))

      result?.current?.hardRedirect()

      expect(window.location.replace).toHaveBeenCalledTimes(1)
    })
  })
})
