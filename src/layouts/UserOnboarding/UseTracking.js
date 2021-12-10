import {
  trackSegmentEvent,
  pageSegmentEvent,
  identifySegmentEvent,
} from 'services/tracking/segment'
import { useCustomLocation } from 'services/location/hooks'
import isArray from 'lodash/isArray'

export function useTracking() {
  const { path, url } = useCustomLocation()

  return {
    startOnboarding: () => {
      trackSegmentEvent({
        event: 'User Started Onboarding',
        category: 'Onboarding',
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
    completedOnboarding: (id, data) => {
      trackSegmentEvent({
        event: 'User Completed Onboarding',
        category: 'Onboarding',
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
