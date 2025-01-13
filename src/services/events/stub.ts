import { Event, EventContext, EventTracker, Identity } from './types'

export class StubbedEventTracker implements EventTracker {
  identify(_identity: Identity): void {}
  track(_event: Event): void {}
  setContext(_context: EventContext): void {}
}
