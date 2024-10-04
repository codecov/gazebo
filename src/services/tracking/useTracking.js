import * as Sentry from '@sentry/react'

import { useUser } from 'services/user'

import { useTrackFeatureFlags } from './featureFlags'
import { firePendo, pendoDefaultUser, useUpdatePendoWithOwner } from './pendo'
import { getUserData } from './utils'

const trackingInfo = [
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
    options: {
      onSuccess: (user) => {
        if (!user) {
          return handleOnError({ guest: true })
        }
        return handleOnSuccess(user)
      },
      suspense: false,
    },
  })

  useTrackFeatureFlags(user) // TODO: Can probably delete
  useUpdatePendoWithOwner(user)

  const maybeSentryUser = {}
  if (user?.email) {
    maybeSentryUser.email = user?.email
  }
  if (user?.user?.username) {
    maybeSentryUser.username = user?.user?.username
  }

  const sentryUser =
    Object.keys(maybeSentryUser).length === 0 ? null : maybeSentryUser
  Sentry.setUser(sentryUser)

  return { data: user, ...all }
}
