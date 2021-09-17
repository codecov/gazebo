import { useEffect } from 'react'
import * as Cookie from 'js-cookie'

export function useLegacyRedirects({ cookieName, selectedOldUI }) {
  useEffect(() => {
    Cookie.set(cookieName, 'new', {
      expires: 90,
    })

    if (selectedOldUI) {
      Cookie.remove(cookieName)
    }
  }, [cookieName, selectedOldUI])
}
