import { Provider } from 'shared/api/helpers'

import { AmplitudeEventTracker, initAmplitude } from './amplitude/amplitude'

const AMPLITUDE_API_KEY = process.env.REACT_APP_AMPLITUDE_API_KEY

export interface EventTracker {
  // Identifies the user this session belongs to.
  identify(userOwnerId: number | string, username: string): void

  // Add new events as a new overloaded method signature here.
  // Please keep the `eventType`s very generic as we have a limited number of
  // them. Instead, add more detail in `eventProperties` where possible.
  // Adding event types this way provides type safety for event properties.
  // E.g., every 'Button Clicked' event must have the buttonType property.
  track(
    eventType: 'Button Clicked',
    eventProperties: {
      buttonType: 'Install Github App' | 'Configure Repo'
      buttonLocation?: string
    }
  ): void
  track(
    eventType: 'Page Viewed',
    eventProperties: {
      pageName: 'OwnerPage'
    }
  ): void
}

class StubbedEventTracker implements EventTracker {
  identify(_userOwnerId: string | number, _username: string): void {}
  track(_eventType: string, _eventProperties: any): void {}
}

export function initEventTracker(): void {
  // Calls any init functions for EventTracker implementations
  initAmplitude()
}

// Returns an EventTracker. Provide any of provider, owner, repo that are
// relevant to the event you're going to track. They will be attached to
// any events you send with the returned EventTracker instance.
export function eventTracker(
  provider?: Provider,
  owner?: string,
  repo?: string
): EventTracker {
  if (!AMPLITUDE_API_KEY) {
    // If the API key is not defined, we'll just return a stubbed EventTracker.
    return new StubbedEventTracker()
  }
  return new AmplitudeEventTracker(provider, owner, repo)
}
