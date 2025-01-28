import { Provider } from 'shared/api/helpers'
import { loginProviderToName } from 'shared/utils/loginProviders'

//
// Add new events to the the Event union type below!
//
// Adding event types in this way provides type safety for names and event
// properties.
// E.g., every 'Button Clicked' event must have the buttonName property.
//
// Guidelines:
//  - Event names should:
//    - be of the form "[Noun] [Past-tense verb]",
//    - have each word capitalized,
//    - describe an action taken by the user.
//  - Keep the values of `type` very generic as we have a limited number of
//    them. Instead, add more detail in `properties` where possible.
//  - Try to keep event property names unique to the event type to avoid
//    accidental correlation of unrelated events.
//  - Never include names, only use ids. E.g., use repoid instead of repo name.
//
//
// If this union type grows too unwieldy, we can split each event out into its
// own type.
//

export type Event =
  | {
      type: 'Button Clicked'
      properties: {
        buttonName: ButtonName
        buttonLocation?: string
        loginProvider?: ReturnType<typeof loginProviderToName> // for login buttons only
      }
    }
  | {
      type: 'Page Viewed'
      properties: {
        pageName: PageName
      }
    }

export type Identity = {
  userOwnerId: number
  provider: Provider
}

// Describes the context to be attached to events. We can extend this as needs
// arise in the future.
export type EventContext = {
  // owner the event is being performed ON, not BY.
  owner?: {
    id: number
  }
  repo?: {
    id: number
    isPrivate?: boolean
  }
  path?: string
}

export abstract class EventTracker {
  // Identifies the user this session belongs to.
  identify(_identity: Identity): void {
    throw new Error(
      'EventTracker is abstract. Method identify must be implemented.'
    )
  }

  // Tracks an event
  track(_event: Event): void {
    throw new Error(
      'EventTracker is abstract. Method track must be implemented.'
    )
  }

  // Sets the current EventContext - see useEventContext hook in hooks.tsx
  setContext(_context: EventContext): void {
    throw new Error(
      'EventTracker is abstract. Method setContext must be implemented.'
    )
  }
}

//
// String union types to make the above Event type easier to visually parse.
// Extend as needed.
//

type ButtonName =
  | 'Install GitHub App'
  | 'Configure Repo'
  | 'Open App Install Modal'
  | 'Continue'
  | 'Login'
  | 'Sync'

type PageName = 'Owner Page'
