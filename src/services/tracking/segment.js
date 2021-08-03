import React from 'react'
import { useUser } from 'services/user'
import { useLocation } from 'react-router-dom'
import { getUserData } from './hooks'
import * as Cookie from 'js-cookie'

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

function identifyFromAnalytics(id, type) {
  return window?.analytics?.identify({
    integrations: {
      Salesforce: false,
      Marketo: false,
    },
    context: {
      externalIds: [
        {
          id,
          type,
          collection: 'users',
          encoding: 'none',
        },
      ],
    },
  })
}

function identifyUser(user) {
  return window?.analytics?.identify(user.ownerid, {
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

function identifySegmentUser(user) {
  if (user.guest) {
    window?.analytics?.identify({})
    return
  }

  const gaId = Cookie.get('_ga')
  const marketoId = Cookie.get('_mkto_trk')

  if (gaId) identifyFromAnalytics(gaId, 'ga_client_id')
  if (marketoId) identifyFromAnalytics(marketoId, 'marketo_cookie')

  identifyUser(user)
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
    window?.analytics?.page()
  }, [location.pathname])
}
