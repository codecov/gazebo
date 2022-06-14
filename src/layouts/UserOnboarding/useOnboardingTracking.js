import isArray from 'lodash/isArray'

import { useOnboardingLocation } from 'services/location/hooks'
import {
  identifySegmentEvent,
  pageSegmentEvent,
  trackSegmentEvent,
} from 'services/tracking/segment'

export function useOnboardingTracking() {
  const { path, url } = useOnboardingLocation()

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
    selectRepository: (user, repo) => {
      const id = user?.trackingMetadata?.ownerid
      trackSegmentEvent({
        event: 'User Onboarding Selected Repo',
        data: {
          category: 'Onboarding',
        },
      })
      identifySegmentEvent({ id, repo })
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
  }
}
