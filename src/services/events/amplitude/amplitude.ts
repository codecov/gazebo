import * as amplitude from '@amplitude/analytics-browser'

import { Provider } from 'shared/api/helpers'
import {
  InternalProvider,
  providerToInternalProvider,
} from 'shared/utils/provider'

import { EventTracker } from '../events'
import { Event } from '../types'

const AMPLITUDE_API_KEY = process.env.REACT_APP_AMPLITUDE_API_KEY

export function initAmplitude() {
  if (!AMPLITUDE_API_KEY) {
    return
  }
  amplitude.init(AMPLITUDE_API_KEY, {
    // Disable all autocapture - may change this in the future
    autocapture: false,
    minIdLength: 1, // Necessary to accommodate our owner ids
  })
}

export class AmplitudeEventTracker implements EventTracker {
  #provider?: InternalProvider
  #owner?: string
  #providerOwner?: string
  #repo?: string

  constructor(provider?: Provider, owner?: string, repo?: string) {
    if (!AMPLITUDE_API_KEY) {
      throw new Error(
        'AMPLITUDE_API_KEY is not defined. Ensure the environment variable is defined before attempting to initialize AmplitudeEventTracker.'
      )
    }
    this.#provider = provider ? providerToInternalProvider(provider) : undefined
    this.#owner = owner
    this.#providerOwner =
      this.#provider && this.#owner
        ? formatProviderOwner(this.#provider, this.#owner)
        : undefined
    this.#repo = repo
  }

  identify({
    userOwnerId,
    username,
  }: {
    userOwnerId: number
    username: string
  }) {
    amplitude.setUserId(userOwnerId.toString())
    const identifyEvent = new amplitude.Identify()
    if (this.#provider) {
      identifyEvent.set('provider', this.#provider)
    }
    identifyEvent.set('username', username)
    amplitude.identify(identifyEvent)
  }

  track(event: Event) {
    amplitude.track({
      // eslint-disable-next-line camelcase
      event_type: event.type,
      // eslint-disable-next-line camelcase
      event_properties: {
        owner: this.#providerOwner,
        repo: this.#repo,
        ...event.properties,
      },
      // This attaches the event to the owner's user group as well
      groups: this.#providerOwner
        ? {
            owner: this.#providerOwner,
          }
        : undefined,
    })
  }
}

function formatProviderOwner(provider: InternalProvider, ownerName: string) {
  // Helper function to format the owner group name.
  // The reason for this is owner names are not unique on their own, but
  // provider/owner names are.
  return `${provider}/${ownerName}`
}
