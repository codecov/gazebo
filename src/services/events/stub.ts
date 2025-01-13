import { EventTracker } from './events'
import { Event } from './types'

export class StubbedEventTracker implements EventTracker {
  identify({
    userOwnerId: _userOwnerId,
    username: _username,
  }: {
    userOwnerId: number
    username: string
  }): void {}
  track(_event: Event): void {}
}
