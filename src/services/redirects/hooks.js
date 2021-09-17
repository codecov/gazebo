import { useEffect } from 'react'
import * as Cookie from 'js-cookie'

export function useLegacyRedirects({ cookieName, selectedOldUI }) {
  useEffect(() => {
    Cookie.set(cookieName, 'new', {
      expires: 90,
    })

    // window.location.href = 'https://google.com'

    if (selectedOldUI) {
      Cookie.remove(cookieName)
      // send/redirect http request with cookie ^
    }
  }, [cookieName, selectedOldUI])
}
