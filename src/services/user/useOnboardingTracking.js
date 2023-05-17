import isArray from 'lodash/isArray'
import { useLocation } from 'react-router-dom'

import {
  identifySegmentEvent,
  pageSegmentEvent,
  trackSegmentEvent,
} from 'services/tracking/segment'
import { useUser } from 'services/user'

export function useOnboardingTracking() {
  // TODO: create an app context where tracking meta data is shared within the app
  const { data: user } = useUser()

  const { pathname: path } = useLocation()
  const url = window.location.href

  return {
    startOnboarding: () => {
      trackSegmentEvent({
        event: 'User Started Onboarding',
        data: {
          category: 'Onboarding',
        },
      })
      const customPath = '/onboarding/1'
      pageSegmentEvent({
        event: 'Onboarding Page 1',
        path: path + customPath,
        url: url + customPath,
      })
    },
    secondPage: () => {
      const customPath = '/onboarding/2'
      pageSegmentEvent({
        event: 'Onboarding Page 2',
        path: path + customPath,
        url: url + customPath,
      })
    },
    helpFindingOrganization: () => {
      trackSegmentEvent({
        event: 'User Onboarding Help Finding Org Clicked',
        data: {
          category: 'Onboarding',
        },
      })
    },
    skipOnboarding: () => {
      trackSegmentEvent({
        event: 'User Onboarding Skipped',
        data: {
          category: 'Onboarding',
        },
      })
    },
    selectOrganization: (user, organization) => {
      const id = user?.trackingMetadata?.ownerid
      trackSegmentEvent({
        event: 'User Onboarding Selected Org',
        data: {
          category: 'Onboarding',
        },
      })
      identifySegmentEvent({ id, organization })
    },
    completedOnboarding: (user, data) => {
      const id = user?.trackingMetadata?.ownerid
      trackSegmentEvent({
        event: 'User Completed Onboarding',
        data: {
          category: 'Onboarding',
        },
      })

      // Changing arrays to semicolon delimiting strings for analytics purposes
      for (let [key, value] of Object.entries(data)) {
        if (isArray(value)) {
          data[key] = value.join(';')
        }
      }
      identifySegmentEvent({ id, data })
    },
    downloadUploaderClicked: () => {
      trackSegmentEvent({
        event: 'User Onboarding Download Uploader Clicked',
        data: {
          category: 'Onboarding',
          userId: user?.trackingMetadata?.ownerid,
        },
      })
    },
    copiedCIToken: (token) => {
      trackSegmentEvent({
        event: 'User Onboarding Copied CI Token',
        data: {
          category: 'Onboarding',
          userId: user?.trackingMetadata?.ownerid,
          tokenHash: token.slice(token.length - 8),
        },
      })
    },
    terminalUploaderCommandClicked: () => {
      trackSegmentEvent({
        event: 'User Onboarding Terminal Uploader Command Clicked',
        data: {
          category: 'Onboarding',
          userId: user?.trackingMetadata?.ownerid,
        },
      })
    },
  }
}
