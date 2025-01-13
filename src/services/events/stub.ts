import { EventTracker } from './events'

export class StubbedEventTracker implements EventTracker {
  identify(_userOwnerId: string | number, _username: string): void {}
  track(_eventType: string, _eventProperties: any): void {}
}
