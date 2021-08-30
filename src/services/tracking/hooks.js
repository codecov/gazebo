import { useUser } from 'services/user'
import { gtmUser, setDataLayer } from './gtm'
import { segmentUser, identifySegmentUser, useSegmentPage } from './segment'
import { getUserData } from './utils'

const trackingInfo = [
  {
    name: 'GTM',
    callback: setDataLayer,
    defaultUser: gtmUser,
  },
  {
    name: 'Segment',
    callback: identifySegmentUser,
    defaultUser: segmentUser,
  },
]

export function handleOnSuccess(user) {
  trackingInfo.forEach((platform) => {
    const { callback, defaultUser } = platform
    callback(getUserData(user, defaultUser))
  })
}

export function handleOnError(guest) {
  trackingInfo.forEach((platform) => {
    const { callback } = platform
    callback(guest)
  })
}

export function useTracking() {
  useSegmentPage()

  return useUser({
    onSuccess: (user) => handleOnSuccess(user),
    onError: (data) => handleOnError({ guest: true }),
    suspense: false,
  })
}
