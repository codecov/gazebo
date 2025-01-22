import { EventTracker } from '../types'

//
// Use this mock by
// vi.mock('services/events/events')
// and
// expect(eventTracker().track).toHaveBeenCalledWith()
//

const MOCK_EVENT_TRACKER: EventTracker = {
  identify: vi.fn(),
  track: vi.fn(),
  setContext: vi.fn(),
}

export function eventTracker() {
  return MOCK_EVENT_TRACKER
}
