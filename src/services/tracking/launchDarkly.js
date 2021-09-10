import { useLDClient } from 'launchdarkly-react-client-sdk'
import { useEffect } from 'react'

import { getUserData } from './utils'

const defaultUser = {
  name: null,
  email: null,
  key: null,
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
  name: 'guest',
  email: null,
  key: 'guest',
}

function createUser(user) {
  const { custom: defaultCustom, ...defaultMain } = defaultUser
  const topLevelUser = Object.assign({}, defaultMain, user, {
    key: user.trackingMetadata.ownerid,
  })
  return { ...topLevelUser, custom: getUserData(user, defaultCustom) }
}

export function useLaunchDarkly(user) {
  const ldClient = useLDClient()

  useEffect(() => {
    if (user) {
      if (user.guest) {
        ldClient?.identify(guestUser)
      } else {
        const data = createUser(user)
        if (data.key) {
          ldClient?.identify(data)
        }
      }
    }
  }, [user, ldClient])
}

export function setDataLayer() {}
