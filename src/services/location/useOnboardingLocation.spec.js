import { renderHook } from '@testing-library/react-hooks'

import { useOnboardingLocation } from './useOnboardingLocation'

describe('useOnboardingLocation', () => {
  let originalLocation

  beforeEach(() => {
    originalLocation = window.location
  })

  afterEach(() => {
    window.location = originalLocation
  })

  it('returns the appropriate url and path based on the windows object', () => {
    delete window.location
    window.location = {
      href: 'http://CRRocks.com/1/2/3',
      pathname: '/1/2/3',
    }
    const { result } = renderHook(() => useOnboardingLocation())
    expect(result.current).toEqual({
      path: '/1/2/3',
      url: 'http://CRRocks.com/1/2/3',
    })
  })
})
