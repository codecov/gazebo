import { captureException } from '@sentry/react'

import config from 'config'

import { AmplitudeEventTracker, initAmplitude } from './amplitude/amplitude'
import { Event, EventContext, EventTracker, Identity } from './types'

export class StubbedEventTracker implements EventTracker {
  identify(_identity: Identity): void {}
  track(_event: Event): void {}
  setContext(_context: EventContext): void {}
}

// EventTracker singleton
let EVENT_TRACKER: EventTracker = new StubbedEventTracker()

export function initEventTracker(): void {
  // Sets the global EventTracker singleton and calls necessary init functions
  try {
    initAmplitude()
    EVENT_TRACKER = new AmplitudeEventTracker()
  } catch (e) {
    if (config.ENV === 'production') {
      // If in production, we need to know this has occurred.
      captureException(e)
    }
  }
}

// Returns the global EventTracker instance.
export function eventTracker(): EventTracker {
  return EVENT_TRACKER
}
