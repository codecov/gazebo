import { renderHook } from '@testing-library/react-hooks'
import { useLegacyRedirects } from './hooks'
import Cookie from 'js-cookie'

describe('useLegacyRedirects', () => {
  let getSpy
  function setup({ cookieName, selectedOldUI, pathname }) {
    renderHook(() =>
      useLegacyRedirects({ cookieName, selectedOldUI, pathname })
    )
  }

  describe('when the old UI is selected', () => {
    let props
    beforeEach(() => {
      getSpy = jest.spyOn(Cookie, 'set')
      props = {
        cookieName: 'cookie-monster',
        selectedOldUI: true,
        pathname: '/gh/codecov/',
      }
      setup(props)
    })

    afterEach(() => {
      getSpy.mockRestore()
    })

    it('sets the cookie with old name, expiration of 90 days and path of pathname', () => {
      expect(getSpy).toHaveBeenCalledWith('cookie-monster', 'old', {
        domain: '.codecov.io',
        expires: 90,
        path: '/gh/codecov/',
      })
    })
  })

  describe('when cookie is set to old', () => {
    beforeEach(() => {
      const props = {
        cookieName: 'cookie-monster',
        selectedOldUI: false,
        pathname: '/gh/codecov/123',
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
