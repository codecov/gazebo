import { useUser } from 'services/user'
import { gtmUser, setDataLayer } from './gtm'
import { segmentUser, identifySegmentUser, useSegmentPage } from './segment'
import { useTrackFeatureFlags } from './featureFlags'
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
  const { data: user, ...all } = useUser({
    onSuccess: (user) => handleOnSuccess(user),
    onError: () => handleOnError({ guest: true }),
    suspense: false,
  })

  useTrackFeatureFlags(user)
  useSegmentPage()

  return { data: user, ...all }
}
