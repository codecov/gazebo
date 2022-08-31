import { useUser } from 'services/user'

import { useTrackFeatureFlags } from './featureFlags'
import { gtmUser, setDataLayer } from './gtm'
import { firePendo, pendoDefaultUser, useUpdatePendoWithOwner } from './pendo'
import { identifySegmentUser, segmentUser, useSegmentPage } from './segment'
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
  {
    name: 'Pendo',
    callback: firePendo,
    defaultUser: pendoDefaultUser,
  },
]

function handleOnSuccess(user) {
  trackingInfo.forEach((platform) => {
    const { callback, defaultUser } = platform
    callback(getUserData(user, defaultUser))
  })
}

function handleOnError(guest) {
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
  useUpdatePendoWithOwner(user)

  return { data: user, ...all }
}
