import { Config, CoreClient, Event } from '@amplitude/analytics-types'

import config from 'config'

import {
  AmplitudeEventTracker,
  initAmplitude,
  pageViewTrackingSanitization,
} from './amplitude'

const mockIdentifySet = vi.hoisted(() => vi.fn())
const mockIdentifyConstructor = vi.hoisted(() => vi.fn())
const mockAmplitude = vi.hoisted(() => {
  class MockIdentify {
    constructor() {
      mockIdentifyConstructor()
    }
    set(key: string, value: any) {
      mockIdentifySet(key, value)
    }
  }
  return {
    add: vi.fn(),
    init: vi.fn(),
    track: vi.fn(),
    identify: vi.fn(),
    setUserId: vi.fn(),
    Identify: MockIdentify,
  }
})
vi.mock('@amplitude/analytics-browser', () => mockAmplitude)

afterEach(() => {
  vi.resetAllMocks()
})

describe('when initAmplitude is called', () => {
  describe('and AMPLITUDE_API_KEY is not defined', () => {
    it('throws an error', () => {
      config.AMPLITUDE_API_KEY = undefined
      try {
        initAmplitude()
      } catch (e) {
        expect(e).toEqual(
          new Error(
            'AMPLITUDE_API_KEY is not defined. Amplitude events will not be tracked.'
          )
        )
      }
    })
  })

  describe('and AMPLITUDE_API_KEY is defined', () => {
    it('calls amplitude.init() with api key', () => {
      config.AMPLITUDE_API_KEY = 'asdf1234'
      initAmplitude()
      expect(mockAmplitude.init).toHaveBeenCalled()
    })
  })
})

describe('pageViewTrackingSanitization', () => {
  it('removes sensitive info from Page Viewed event properties', async () => {
    const plugin = pageViewTrackingSanitization()

    if (plugin.setup) {
      plugin?.setup({} as Config, {} as CoreClient)
    }

    if (plugin.execute) {
      const event = await plugin.execute({
        event_type: '[Amplitude] Page Viewed',
        event_properties: {
          '[Amplitude] Page Counter': 1,
          '[Amplitude] Page Domain': 'app.codecov.io',
          '[Amplitude] Page Title': 'Codecov',
          '[Amplitude] Page Path': '/sensitive/info',
          '[Amplitude] Page Location': 'https://app.codecov.io/sensitive/info',
          '[Amplitude] Page URL': 'https://app.codecov.io/sensitive/info',
        },
      } as Event)
      expect(event?.event_properties).toMatchObject({
        '[Amplitude] Page Counter': 1,
        '[Amplitude] Page Domain': 'app.codecov.io',
        '[Amplitude] Page Title': 'Codecov',
        path: undefined,
      })
    }
  })

  it('does not touch other event types', async () => {
    const plugin = pageViewTrackingSanitization()

    if (plugin.setup) {
      plugin?.setup({} as Config, {} as CoreClient)
    }

    if (plugin.execute) {
      const event = await plugin.execute({
        event_type: 'Button Clicked',
        event_properties: {
          '[Amplitude] Page Path': '/sensitive/info',
        },
      } as Event)
      expect(event?.event_properties).toMatchObject({
        '[Amplitude] Page Path': '/sensitive/info',
      })
    }
  })
})

describe('AmplitudeEventTracker', () => {
  describe('identify', () => {
    describe('when identify is called', () => {
      it('calls appropriate sdk functions', () => {
        const tracker = new AmplitudeEventTracker()
        tracker.identify({
          provider: 'gh',
          userOwnerId: 123,
        })
        expect(mockAmplitude.setUserId).toHaveBeenCalledWith('123')
        expect(mockIdentifyConstructor).toHaveBeenCalled()
        expect(mockIdentifySet).toHaveBeenCalledWith('provider', 'github')
        expect(mockAmplitude.identify).toHaveBeenCalled()
        expect(tracker.identity).toEqual({
          userOwnerId: 123,
          provider: 'gh',
        })
      })
    })

    describe('when identify is called multiple times with the same identity', () => {
      it('does not make any amplitude calls', () => {
        const tracker = new AmplitudeEventTracker()
        tracker.identify({
          provider: 'gh',
          userOwnerId: 123,
        })

        vi.resetAllMocks()

        tracker.identify({
          provider: 'gh',
          userOwnerId: 123,
        })

        expect(mockAmplitude.setUserId).not.toHaveBeenCalled()

        expect(tracker.identity).toEqual({
          userOwnerId: 123,
          provider: 'gh',
        })
      })
    })
  })

  describe('track', () => {
    describe('when track is called with no context', () => {
      it('does not populate any context', () => {
        const tracker = new AmplitudeEventTracker()
        tracker.track({
          type: 'Button Clicked',
          properties: {
            buttonName: 'Configure Repo',
          },
        })

        expect(mockAmplitude.track).toHaveBeenCalledWith({
          event_type: 'Button Clicked',
          event_properties: {
            buttonName: 'Configure Repo',
          },
        })
      })
    })

    describe('when track is called with context', () => {
      it('populates context as event properties', () => {
        const tracker = new AmplitudeEventTracker()
        tracker.setContext({
          ownerid: 123,
          repoid: 321,
          repoIsPrivate: false,
          path: '/:provider/:owner',
        })

        tracker.track({
          type: 'Button Clicked',
          properties: {
            buttonName: 'Configure Repo',
          },
        })

        expect(mockAmplitude.track).toHaveBeenCalledWith({
          event_type: 'Button Clicked',
          event_properties: {
            buttonName: 'Configure Repo',
            ownerid: 123,
            repoid: 321,
            repoIsPrivate: false,
            path: '/:provider/:owner',
          },
          groups: {
            org: 123,
          },
        })
      })
    })
  })
})
