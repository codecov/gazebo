import * as amplitude from '@amplitude/analytics-browser'

import config from 'config'

import { providerToInternalProvider } from 'shared/utils/provider'

import { Event, EventContext, EventTracker, Identity } from '../types'

export function initAmplitude() {
  const apiKey = config.AMPLITUDE_API_KEY
  if (!apiKey) {
    throw new Error(
      'AMPLITUDE_API_KEY is not defined. Amplitude events will not be tracked.'
    )
  }
  amplitude.init(apiKey, {
    // Disable all autocapture - may change this in the future
    autocapture: false,
    minIdLength: 1, // Necessary to accommodate our owner ids
  })
}

export class AmplitudeEventTracker implements EventTracker {
  context: EventContext = {}
  identity?: Identity

  identify(identity: Identity) {
    if (this.identity?.userOwnerId === identity.userOwnerId) {
      // Don't identify this user again this session.
      return
    }

    amplitude.setUserId(identity.userOwnerId.toString())
    const identifyEvent = new amplitude.Identify()
    identifyEvent.set('provider', providerToInternalProvider(identity.provider))
    amplitude.identify(identifyEvent)

    this.identity = identity
  }

  track(event: Event) {
    amplitude.track({
      // eslint-disable-next-line camelcase
      event_type: event.type,
      // eslint-disable-next-line camelcase
      event_properties: {
        ...event.properties,
        ...this.context,
      },
      // This attaches the event to the owner's user group (org) as well
      groups: this.context.ownerid
        ? {
            org: this.context.ownerid,
          }
        : undefined,
    })
  }

  setContext(context: EventContext) {
    this.context = context
  }
}
