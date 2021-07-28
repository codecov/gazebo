import React from 'react'
import { useUser } from 'services/user'
import { useLocation } from 'react-router-dom'
import { getUserData } from './hooks'

const defaultUser = {
  ownerid: null,
  email: 'unknown@codecov.io',
  name: 'unknown',
  username: 'unknown',
  service: null,
  plan: null,
  staff: null,
  serviceId: null,
}

function identifySegmentUser(user) {
  // const gaId = cookies._ga
  // const marketoId = cookies._mrkt

  // if (cookies._ga) {

  // }
  // else if (cookies._mrkt) {

  // }
  // else if (user.guest) {

  // }

  window.analytics.identify(user.ownerid, {
    userId: user.ownerid,
    traits: {
      ...user,
    },
    integrations: {
      Salesforce: true,
      Marketo: false,
    },
    context: {
      externalIds: {
        id: user.service_id,
        type: user.service + '_id',
        collections: 'users',
        encoding: 'none',
      },
    },
  })
}

export function useSegmentUser() {
  return useUser({
    onSuccess: (user) => identifySegmentUser(getUserData(user, defaultUser)),
    onError: (data) => identifySegmentUser({ guest: true }),
    suspense: false,
  })
}

export function useSegmentPage() {
  const location = useLocation()

  React.useEffect(() => {
    window.analytics.page()
  }, [location.pathname])
}
