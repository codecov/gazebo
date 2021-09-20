import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import Cookie from 'js-cookie'
import qs from 'qs'

export function useImpersonate() {
  const { search } = useLocation()
  const { user } = qs.parse(search, {
    ignoreQueryPrefix: true,
  })

  useEffect(() => {
    if (user && user !== '') {
      Cookie.set('staff_user', user)
    } else if (user === '') {
      // Delete staff_user from url ?user
      Cookie.remove('staff_user')
    }
  }, [user])

  return { isImpersonating: !!Cookie.get('staff_user') }
}
