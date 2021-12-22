import { renderHook } from '@testing-library/react-hooks'
import { useOnboardingLocation } from './hooks'

describe('useOnboardingLocation', () => {
  let hookData
  let originalLocation

  function setup() {
    hookData = renderHook(() => useOnboardingLocation())
  }

  beforeEach(() => {
    originalLocation = window.location
  })

  afterEach(() => {
    window.location = originalLocation
  })

  it('returns the approriate url and path based on the windows object', () => {
    delete window.location
    window.location = {
      href: 'http://CRRocks.com/1/2/3',
      pathname: '/1/2/3',
    }
    setup()
    expect(hookData.result.current).toEqual({
      path: '/1/2/3',
      url: 'http://CRRocks.com/1/2/3',
    })
  })
})
