import { Provider } from 'shared/api/helpers'

//
// Add new events to the the Event union type below!
//
// Adding event types in this way provides type safety for names and event
// properties.
// E.g., every 'Button Clicked' event must have the buttonType property.
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

export type Event =
  | {
      type: 'Button Clicked'
      properties: {
        buttonType: 'Install GitHub App' | 'Configure Repo'
        buttonLocation?: string
      }
    }
  | {
      type: 'Page Viewed'
      properties: {
        pageName: 'Owner Page'
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

  // Sets the current EventContext
  setContext(_context: EventContext): void {
    throw new Error(
      'EventTracker is abstract. Method setContext must be implemented.'
    )
  }
}
