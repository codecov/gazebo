import { renderHook } from '@testing-library/react-hooks'
import Cookie from 'js-cookie'

import { useIdentifyUser } from 'shared/featureFlags'

import { useTrackFeatureFlags } from './featureFlags'

jest.mock('shared/featureFlags', () => ({
  useIdentifyUser: jest.fn(),
}))

describe('useTrackFeatureFlags', () => {
  const mockUdentifyUser = jest.fn()

  function setup(user, impersonate) {
    renderHook(() => useTrackFeatureFlags(user, impersonate))
  }

  describe('normal use', () => {
    beforeEach(() => {
      useIdentifyUser.mockImplementation(mockUdentifyUser)
      setup({
        email: 'test@test.com',
        user: { avatarUrl: 'doggo.picz', name: 'doggo' },
        trackingMetadata: { ownerid: 'hello' },
      })
    })
    afterEach(() => jest.clearAllMocks())

    it('Creates the expected user object and sends it to the feature flag service', () => {
      expect(mockUdentifyUser).lastCalledWith({
        name: 'doggo',
        email: 'test@test.com',
        key: 'hello',
        avatar: 'doggo.picz',
        custom: {
          guest: false,
          student: false,
          username: null,
          service: null,
          ownerid: 'hello',
          service_id: null,
          plan: null,
          staff: true,
          has_yaml: false,
          bot: null,
          delinquent: null,
          did_trial: null,
          plan_provider: null,
          plan_user_count: null,
          created_at: null,
          updated_at: null,
        },
      })
    })
  })

  describe('impersonating on github', () => {
    beforeEach(() => {
      useIdentifyUser.mockImplementation(mockUdentifyUser)
      Cookie.set('github-username', 'laudna')
      setup({
        email: 'test@test.com',
        user: { avatarUrl: 'doggo.picz', name: 'doggo' },
        trackingMetadata: { ownerid: 'hello' },
      })
    })
    afterEach(() => jest.clearAllMocks())

    it('Creates the expected user object and sends it to the feature flag service', () => {
      expect(mockUdentifyUser).lastCalledWith({
        name: 'doggo',
        email: 'test@test.com',
        key: 'hello',
        avatar: 'doggo.picz',
        custom: {
          guest: false,
          student: false,
          username: 'laudna',
          service: null,
          ownerid: 'hello',
          service_id: null,
          plan: null,
          staff: true,
          has_yaml: false,
          bot: null,
          delinquent: null,
          did_trial: null,
          plan_provider: null,
          plan_user_count: null,
          created_at: null,
          updated_at: null,
        },
      })
    })
  })

  describe('impersonating on bitbucket', () => {
    beforeEach(() => {
      useIdentifyUser.mockImplementation(mockUdentifyUser)
      Cookie.set('bitbucket-username', 'laudna')
      setup({
        email: 'test@test.com',
        user: { avatarUrl: 'doggo.picz', name: 'doggo' },
        trackingMetadata: { ownerid: 'hello' },
      })
    })
    afterEach(() => jest.clearAllMocks())

    it('Creates the expected user object and sends it to the feature flag service', () => {
      expect(mockUdentifyUser).lastCalledWith({
        name: 'doggo',
        email: 'test@test.com',
        key: 'hello',
        avatar: 'doggo.picz',
        custom: {
          guest: false,
          student: false,
          username: 'laudna',
          service: null,
          ownerid: 'hello',
          service_id: null,
          plan: null,
          staff: true,
          has_yaml: false,
          bot: null,
          delinquent: null,
          did_trial: null,
          plan_provider: null,
          plan_user_count: null,
          created_at: null,
          updated_at: null,
        },
      })
    })
  })
  describe('impersonating on gitlab', () => {
    beforeEach(() => {
      useIdentifyUser.mockImplementation(mockUdentifyUser)
      Cookie.set('gitlab-username', 'laudna')
      setup({
        email: 'test@test.com',
        user: { avatarUrl: 'doggo.picz', name: 'doggo' },
        trackingMetadata: { ownerid: 'hello' },
      })
    })
    afterEach(() => jest.clearAllMocks())

    it('Creates the expected user object and sends it to the feature flag service', () => {
      expect(mockUdentifyUser).lastCalledWith({
        name: 'doggo',
        email: 'test@test.com',
        key: 'hello',
        avatar: 'doggo.picz',
        custom: {
          guest: false,
          student: false,
          username: 'laudna',
          service: null,
          ownerid: 'hello',
          service_id: null,
          plan: null,
          staff: true,
          has_yaml: false,
          bot: null,
          delinquent: null,
          did_trial: null,
          plan_provider: null,
          plan_user_count: null,
          created_at: null,
          updated_at: null,
        },
      })
    })
  })
})
