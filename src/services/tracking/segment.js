import Cookie from 'js-cookie'
import React from 'react'
import { useLocation } from 'react-router-dom'

export const segmentUser = {
  ownerid: null,
  email: 'unknown@codecov.io',
  name: 'unknown',
  username: 'unknown',
  service: null,
  plan: null,
  staff: null,
  serviceId: null,
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
      externalIds: [
        {
          id: user.service_id,
          type: user.service + '_id',
          collections: 'users',
          encoding: 'none',
        },
      ],
    },
  })
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

export function identifySegmentUser(user) {
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

export function useSegmentPage() {
  const location = useLocation()

  React.useEffect(() => {
    window?.analytics?.page()
  }, [location.pathname])
}

const SegmentTrackEvents = Object.freeze({
  click: 'clicked button',
})

export function trackSegmentEvent(action, label, category) {
  const event = SegmentTrackEvents[action]

  return (
    event &&
    window?.analytics?.track(event, {
      label,
      category,
      value: 1,
    })
  )
}
