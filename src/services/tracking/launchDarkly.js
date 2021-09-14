import { useLDClient } from 'launchdarkly-react-client-sdk'
import { useEffect } from 'react'

import { getUserData } from './utils'

// https://launchdarkly.github.io/js-client-sdk/interfaces/_launchdarkly_js_client_sdk_.lduser.html
const defaultUser = {
  name: null,
  email: null,
  key: null,
  avatar: null,
  custom: {
    student: false,
    username: null,
    service: null,
    ownerid: null,
    serviceId: null,
    plan: null,
    staff: true,
    hasYaml: false,
    bot: null,
    delinquent: null,
    didTrial: null,
    planProvider: null,
    planUserCount: null,
    createdAt: null,
    updatedAt: null,
  },
}

const guestUser = {
  anonymous: true,
}

function createUser(user) {
  const { custom: defaultCustom, ...defaultTopLevel } = defaultUser
  const topLevelUser = Object.assign({}, defaultTopLevel, {
    key: user.trackingMetadata.ownerid,
    name: user.user.name,
    email: user.email,
    avatar: user.user.avatarUrl,
  })
  return { ...topLevelUser, custom: getUserData(user, defaultCustom) }
}

export function useLaunchDarkly(user) {
  const ldClient = useLDClient()

  useEffect(() => {
    if (ldClient && user) {
      if (user.guest) {
        ldClient.identify(guestUser)
      } else {
        const data = createUser(user)
        if (data.key) {
          ldClient.identify(data)
        }
      }
    }
  }, [user, ldClient])
}
