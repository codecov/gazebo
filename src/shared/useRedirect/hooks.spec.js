import { renderHook } from '@testing-library/react-hooks'

import { useRedirect } from './hooks'

const href = `/account/gh/rula/billing`
describe('useRedirect', () => {
  let originalLocation, hookData

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

  function setup() {
    hookData = renderHook(() => useRedirect({ href }))
  }

  describe('When data is loaded', () => {
    beforeEach(() => {
      setup()
      return hookData.waitFor(() => hookData.result.current.isSuccess)
    })

    it('location replace was called (redirected)', () => {
      const { hardRedirect } = hookData?.result?.current
      hardRedirect()

      expect(window.location.replace).toHaveBeenCalledTimes(1)
    })
  })
})
