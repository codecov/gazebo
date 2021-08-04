import React from 'react'
import { useUser } from 'services/user'
import { useLocation } from 'react-router-dom'
import * as Cookie from 'js-cookie'

const gtmUser = {
  ownerid: null,
  avatar: null,
  serviceId: null,
  plan: null,
  staff: null,
  hasYaml: null,
  service: null,
  email: 'unknown@codecov.io',
  name: 'unknown',
  username: 'unknown',
  student: false,
  bot: false,
  delinquent: false,
  didTrial: false,
  privateAccess: false,
  planProvider: '',
  planUserCount: 5,
  createdAt: '2014-01-01T12:00:00.000Z',
  updatedAt: '2014-01-01T12:00:00.000Z',
  studentCreatedAt: '2014-01-01T12:00:00.000Z',
  studentUpdatedAt: '2014-01-01T12:00:00.000Z',
}

const segmentUser = {
  ownerid: null,
  email: 'unknown@codecov.io',
  name: 'unknown',
  username: 'unknown',
  service: null,
  plan: null,
  staff: null,
  serviceId: null,
}

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

function setDataLayer(user) {
  window.dataLayer = [
    {
      codecov: {
        app: {
          version: 'react-app',
        },
        user,
      },
    },
  ]
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

function handleOnSuccess(user) {
  trackingInfo.forEach((platform) => {
    const { callback, defaultUser } = platform
    callback(user, defaultUser)
  })
}

function handleOnError(guest) {
  trackingInfo.forEach((platform) => {
    const { callback } = platform
    callback(guest)
  })
}

function useSegmentPage() {
  const location = useLocation()

  React.useEffect(() => {
    window?.analytics?.page()
  }, [location.pathname])
}

export function useTracking() {
  useSegmentPage()

  return useUser({
    onSuccess: (user) => handleOnSuccess(user),
    onError: (data) => handleOnError({ guest: true }),
    suspense: false,
  })
}
