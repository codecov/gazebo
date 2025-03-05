import config from 'config'

import { eventTracker, initEventTracker, StubbedEventTracker } from './events'
import { EventTracker } from './types'

vi.mock('config')
const mockCaptureException = vi.hoisted(() => vi.fn())
vi.mock('@sentry/react', () => ({
  captureException: mockCaptureException,
}))
const mockInitAmplitude = vi.hoisted(() => vi.fn())
vi.mock('./amplitude/amplitude', () => ({
  initAmplitude: mockInitAmplitude,
  AmplitudeEventTracker: vi.fn(),
}))

afterEach(() => {
  vi.resetAllMocks()
})

describe('EventTracker', () => {
  describe('StubbedEventTracker', () => {
    it('should accept calls without error', () => {
      const stubbedEventTracker = eventTracker()
      expect(stubbedEventTracker).toBeInstanceOf(StubbedEventTracker)

      stubbedEventTracker.setContext({})
      stubbedEventTracker.identify({
        userOwnerId: 1,
        provider: 'gh',
      })
      stubbedEventTracker.track({
        type: 'Button Clicked',
        properties: {
          buttonName: 'Install GitHub App',
          buttonLocation: 'Org selector',
        },
      })
    })
  })

  describe('abstract EventTracker', () => {
    it('should throw errors if instantiated', () => {
      // @ts-expect-error instantiating an abstract class
      const tracker = new EventTracker()
      try {
        tracker.setContext({})
      } catch (e) {
        expect(e).toEqual(
          new Error(
            'EventTracker is abstract. Method setContext must be implemented.'
          )
        )
      }

      try {
        tracker.identify({
          userOwnerId: 1,
          provider: 'gh',
        })
      } catch (e) {
        expect(e).toEqual(
          new Error(
            'EventTracker is abstract. Method identify must be implemented.'
          )
        )
      }

      try {
        tracker.track({
          type: 'Button Clicked',
          properties: {
            buttonName: 'Install GitHub App',
            buttonLocation: 'test',
          },
        })
      } catch (e) {
        expect(e).toEqual(
          new Error(
            'EventTracker is abstract. Method track must be implemented.'
          )
        )
      }
    })
  })

  describe('when initEventTracker is called', () => {
    describe('and initAmplitude() throws an error', () => {
      beforeEach(() => {
        mockInitAmplitude.mockImplementationOnce(() => {
          throw new Error('oopsie')
        })
      })

      describe('and ENV is production', () => {
        beforeEach(() => {
          config.ENV = 'production'
        })

        it('calls sentry.captureException()', () => {
          initEventTracker()
          expect(mockCaptureException).toHaveBeenCalledOnce()
        })

        it('does not set EVENT_TRACKER to Amplitude instance', () => {
          const initialTracker = eventTracker()
          initEventTracker()
          const afterTracker = eventTracker()
          expect(afterTracker).toBe(initialTracker)
        })
      })

      describe('and ENV is not production', () => {
        beforeEach(() => {
          config.ENV = 'development'
        })

        it('does not call sentry.captureException()', () => {
          initEventTracker()
          expect(mockCaptureException).not.toHaveBeenCalled()
        })

        it('does not set EVENT_TRACKER to Amplitude instance', () => {
          const initialTracker = eventTracker()
          initEventTracker()
          const afterTracker = eventTracker()
          expect(afterTracker).toBe(initialTracker)
        })
      })
    })

    describe('and initAmplitude() does not throw', () => {
      it('sets EVENT_TRACKER to an Amplitude instance', () => {
        const initialTracker = eventTracker()
        initEventTracker()
        const afterTracker = eventTracker()
        expect(afterTracker).not.toBe(initialTracker)
      })
    })
  })

  describe('when eventTracker is called', () => {
    it('should always return the same EventTracker instance', () => {
      initEventTracker()
      const eventTrackerA = eventTracker()
      const eventTrackerB = eventTracker()
      expect(eventTrackerA).toBe(eventTrackerB)
    })
  })
})
