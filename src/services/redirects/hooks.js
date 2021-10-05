import { useEffect } from 'react'
import Cookie from 'js-cookie'
import config from 'config'

export function useLegacyRedirects({ cookieName, selectedOldUI, pathname }) {
  useEffect(() => {
    if (Cookie.get(cookieName) === 'old') {
      window.location.replace(config.BASE_URL + pathname)
    }

    if (selectedOldUI) {
      Cookie.set(cookieName, 'old', {
        expires: 90,
        path: pathname,
      })
    }
  }, [cookieName, selectedOldUI, pathname])
}
