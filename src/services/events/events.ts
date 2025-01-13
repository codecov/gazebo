import { Provider } from 'shared/api/helpers'

import { AmplitudeEventTracker, initAmplitude } from './amplitude/amplitude'
import { StubbedEventTracker } from './stub'
import { Event } from './types'

const AMPLITUDE_API_KEY = process.env.REACT_APP_AMPLITUDE_API_KEY

export abstract class EventTracker {
  // Identifies the user this session belongs to.
  identify({
    userOwnerId: _userOwnerId,
    username: _username,
  }: {
    userOwnerId: number
    username: string
  }): void {
    throw new Error(
      'EventTracker is abstract. Method identify must be implemented.'
    )
  }

  track(_event: Event): void {
    throw new Error(
      'EventTracker is abstract. Method track must be implemented.'
    )
  }
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
