import Cookie from 'js-cookie'
import { useEffect } from 'react'

import config from 'config'

export function useLegacyRedirects({
  cookieName,
  selectedOldUI,
  uri,
  cookiePath,
}) {
  useEffect(() => {
    if (Cookie.get(cookieName) === 'old') {
      window.location.replace(config.BASE_URL + uri)
    }

    if (selectedOldUI) {
      Cookie.set(cookieName, 'old', {
        expires: 90,
        path: cookiePath,
        domain: '.codecov.io',
      })
    }
  }, [cookieName, selectedOldUI, uri, cookiePath])
}
