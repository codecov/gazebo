import { renderHook } from '@testing-library/react-hooks'
import { useLegacyRedirects } from './hooks'
import Cookie from 'js-cookie'

jest.mock('js-cookie')

describe('useLegacyRedirects', () => {
  function setup({ cookieName, selectedOldUI, location }) {
    renderHook(() =>
      useLegacyRedirects({ cookieName, selectedOldUI, location })
    )
  }

  describe('when the old UI is selected', () => {
    beforeEach(() => {
      const props = {
        cookieName: 'cookie-monster',
        selectedOldUI: true,
        location: {
          pathname: '/gh/codecov',
        },
      }
      setup(props)
    })

    it('sets the cookie with old name, expiration of 90 days and path of pathname', () => {
      expect(Cookie.set).toBeCalledWith('cookie-monster', 'old', {
        expires: 90,
        path: '/gh/codecov',
      })
    })
  })

  describe('when cookie is set to old', () => {
    beforeEach(() => {
      const props = {
        cookieName: 'cookie-monster',
        selectedOldUI: false,
        location: {
          pathname: '/gh/codecov/123',
        },
      }
      Cookie.set.mockReturnValue(props.cookieName, 'old')
      setup(props)
    })

    it('changes window location', () => {
      expect(Cookie.get).toBeCalledWith('cookie-monster')
    })
  })
})
