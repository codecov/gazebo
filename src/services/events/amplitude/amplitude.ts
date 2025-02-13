import * as amplitude from '@amplitude/analytics-browser'
import { EnrichmentPlugin } from '@amplitude/analytics-types'

import config from 'config'

import { providerToInternalProvider } from 'shared/utils/provider'

import { eventTracker } from '../events'
import { Event, EventContext, EventTracker, Identity } from '../types'

export const pageViewTrackingSanitization = (): EnrichmentPlugin => {
  return {
    name: 'page-view-tracking-sanitization',
    type: 'enrichment',
    setup: async () => undefined,
    execute: async (event) => {
      /* eslint-disable camelcase */
      if (event.event_type === '[Amplitude] Page Viewed') {
        if (event.event_properties) {
          delete event.event_properties?.['[Amplitude] Page Location']
          delete event.event_properties?.['[Amplitude] Page Path']
          delete event.event_properties?.['[Amplitude] Page URL']
          delete event.event_properties?.['referrer']
          event.event_properties.path = eventTracker().context.path
        }
      }

      return event
    },
  }
}

export function initAmplitude() {
  const apiKey = config.AMPLITUDE_API_KEY
  if (!apiKey) {
    throw new Error(
      'AMPLITUDE_API_KEY is not defined. Amplitude events will not be tracked.'
    )
  }
  amplitude.add(pageViewTrackingSanitization())
  amplitude.init(apiKey, {
    // Disable all autocapture - may change this in the future
    autocapture: {
      attribution: true,
      pageViews: true,
      sessions: true,
      formInteractions: false,
      fileDownloads: false,
      elementInteractions: false,
    },
    minIdLength: 1, // Necessary to accommodate our owner ids
    serverUrl: 'https://amplitude.codecov.io/2/httpapi',
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
