import { renderHook } from '@testing-library/react-hooks'
import { useLocation } from 'react-router-dom'
import * as Cookie from 'js-cookie'
import {
  useSegmentPage,
  identifySegmentUser,
  trackSegmentEvent,
} from './segment'

window.analytics = {
  identify: jest.fn(),
  page: jest.fn(),
  track: jest.fn(),
}

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: jest.fn(),
}))

describe('identifySegmentUser', () => {
  function setup(user) {
    identifySegmentUser(user)
  }

  describe('when user has all the data', () => {
    const user = {
      ownerid: 1,
      service_id: '123',
      plan: 'plan',
      staff: true,
      service: 'github',
      name: 'Test User',
      username: 'test_user',
      email: 'tedlasso@test.com',
      guest: false,
    }

    beforeEach(() => {
      setup(user)
    })

    it('should set full data into identify object', () => {
      expect(window.analytics.identify.mock.instances).toHaveLength(1)
      expect(
        window.analytics.identify.mock.instances[0].identify
      ).toHaveBeenCalled()
      expect(window.analytics.identify).toBeCalledWith(1, {
        context: {
          externalIds: [
            {
              collections: 'users',
              encoding: 'none',
              id: '123',
              type: 'github_id',
            },
          ],
        },
        integrations: {
          Marketo: false,
          Salesforce: true,
        },
        traits: {
          email: 'tedlasso@test.com',
          guest: false,
          name: 'Test User',
          ownerid: 1,
          plan: 'plan',
          service: 'github',
          service_id: '123',
          staff: true,
          username: 'test_user',
        },
        userId: 1,
      })
    })
  })

  describe('when user has all the data and all the cookies', () => {
    const user = {
      ownerid: 1,
      service_id: '123',
      plan: 'plan',
      staff: true,
      service: 'github',
      name: 'Test User',
      username: 'test_user',
      email: 'tedlasso@test.com',
      guest: false,
    }

    beforeEach(() => {
      Cookie.set('_ga', '123')
      Cookie.set('_mkto_trk', '456')
      setup(user)
    })

    afterEach(() => {
      Cookie.remove('_ga')
      Cookie.remove('_mkto_trk')
    })

    it('hook should make 3 different identify calls', () => {
      expect(window.analytics.identify.mock.instances).toHaveLength(3)
      expect(
        window.analytics.identify.mock.instances[0].identify
      ).toBeCalledWith(1, {
        context: {
          externalIds: [
            {
              collections: 'users',
              encoding: 'none',
              id: '123',
              type: 'github_id',
            },
          ],
        },
        integrations: {
          Marketo: false,
          Salesforce: true,
        },
        traits: {
          email: 'tedlasso@test.com',
          guest: false,
          name: 'Test User',
          ownerid: 1,
          plan: 'plan',
          service: 'github',
          service_id: '123',
          staff: true,
          username: 'test_user',
        },
        userId: 1,
      })
      expect(
        window.analytics.identify.mock.instances[1].identify
      ).toBeCalledWith({
        context: {
          externalIds: [
            {
              collection: 'users',
              encoding: 'none',
              id: '123',
              type: 'ga_client_id',
            },
          ],
        },
        integrations: {
          Marketo: false,
          Salesforce: false,
        },
      })
      expect(
        window.analytics.identify.mock.instances[2].identify
      ).toBeCalledWith({
        context: {
          externalIds: [
            {
              collection: 'users',
              encoding: 'none',
              id: '456',
              type: 'marketo_cookie',
            },
          ],
        },
        integrations: {
          Marketo: false,
          Salesforce: false,
        },
      })
    })
  })

  describe('when user is anonymous', () => {
    beforeEach(() => {
      setup({ guest: true })
    })

    it('should make an identify call as a guest', () => {
      expect(window.analytics.identify.mock.instances).toHaveLength(1)
      expect(window.analytics.identify).toBeCalledWith({})
    })
  })
})

describe('useSegmentPage', () => {
  function setup(pathname) {
    useLocation.mockReturnValue({ pathname })
    renderHook(() => useSegmentPage())
  }

  describe('when there is a path change', () => {
    it('makes an analytics page call', () => {
      let pathname = '/gh/thanos'
      setup(pathname)
      expect(window.analytics.page).toHaveBeenCalledTimes(1)
    })
  })

  describe('when there are a n-path changes', () => {
    it('makes nth analytics page calls', () => {
      const owners = ['orly', 'jester', 'nott']

      owners.forEach((owner) => {
        setup('/gh/' + owner)
      })

      expect(window.analytics.page).toHaveBeenCalledTimes(3)
    })
  })
})

describe('trackSegmentEvent', () => {
  function setup(event) {
    trackSegmentEvent(event)
  }

  describe('when event is defined', () => {
    const event = 'sample-button'

    beforeEach(() => {
      setup(event)
    })

    it('returns an track event', () => {
      expect(window.analytics.track.mock.instances[0].track).toHaveBeenCalled()
      expect(
        window.analytics.track.mock.instances[0].track
      ).toHaveBeenCalledWith('clicked button', {
        category: 'repo list cta',
        label: event,
        value: 1,
      })
    })
  })

  describe('when event is undefined', () => {
    const event = undefined

    beforeEach(() => {
      setup(event)
    })

    it('returns an track event', () => {
      expect(window.analytics.track.mock.instances[0]).toBeUndefined()
    })
  })
})
