import { renderHook } from '@testing-library/react-hooks'
import { useLegacyRedirects } from './hooks'
import Cookie from 'js-cookie'

describe('useLegacyRedirects', () => {
  function setup({ cookieName, selectedOldUI, location }) {
    renderHook(() =>
      useLegacyRedirects({ cookieName, selectedOldUI, location })
    )
  }

  describe('when the old UI is selected', () => {
    let props
    beforeEach(() => {
      props = {
        cookieName: 'cookie-monster',
        selectedOldUI: true,
        location: {
          pathname: 'gh/codecov/',
        },
      }
      setup(props)
    })

    it('sets the cookie with old name, expiration of 90 days and path of pathname', () => {
      expect(Cookie.get(props.cookieName)).toBe('old')
    })
  })

  describe('when cookie is set to old', () => {
    beforeEach(() => {
      const props = {
        cookieName: 'cookie-monster',
        selectedOldUI: false,
        location: {
          pathname: 'gh/codecov/123',
        },
      }
      delete global.window.location
      global.window = Object.create(window)
      global.window.location = {
        replace: jest.fn(),
      }
      Cookie.set(props.cookieName, 'old')
      setup(props)
    })

    afterEach(() => {
      delete global.window.location
    })

    it('changes window location', () => {
      expect(window.location.replace).toHaveBeenCalled()
    })
  })
})
