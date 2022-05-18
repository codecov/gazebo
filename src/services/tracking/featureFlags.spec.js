import { renderHook } from '@testing-library/react-hooks'
import Cookie from 'js-cookie'

import { useIdentifyUser } from 'shared/featureFlags'

import { useTrackFeatureFlags } from './featureFlags'

jest.mock('shared/featureFlags', () => ({
  useIdentifyUser: jest.fn(),
}))

describe('useTrackFeatureFlags', () => {
  const mockIdentifyUser = jest.fn()

  function setup(user, impersonate) {
    renderHook(() => useTrackFeatureFlags(user, impersonate))
  }

  describe('normal use', () => {
    beforeEach(() => {
      useIdentifyUser.mockImplementation(mockIdentifyUser)
      Cookie.set('github-username', 'doggo')

      setup({
        email: 'test@test.com',
        user: { avatarUrl: 'doggo.picz', name: 'doggo', username: 'doggo' },
        trackingMetadata: { ownerid: 'hello' },
      })
    })
    afterEach(() => {
      jest.clearAllMocks()
      Cookie.remove('github-username')
    })

    it('Creates the expected user and key identified', () => {
      expect(mockIdentifyUser).lastCalledWith({
        name: 'doggo',
        email: 'test@test.com',
        key: 'hello',
        avatar: 'doggo.picz',
        custom: {
          guest: false,
          student: false,
          username: 'doggo',
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
      useIdentifyUser.mockImplementation(mockIdentifyUser)
      Cookie.set('github-username', 'laudna')
      Cookie.set('staff_user', 'doggo')
      setup({
        email: 'test@test.com',
        user: { avatarUrl: 'doggo.picz', name: 'doggo', username: 'doggo' },
        trackingMetadata: { ownerid: 'hello', staff: true },
      })
    })
    afterEach(() => {
      jest.clearAllMocks()
      Cookie.remove('github-username')
      Cookie.remove('staff_user')
    })
    it('Creates the expected user and key identified', () => {
      expect(mockIdentifyUser).lastCalledWith({
        name: 'doggo',
        email: 'test@test.com',
        key: 'hello-laudna',
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
      useIdentifyUser.mockImplementation(mockIdentifyUser)
      Cookie.set('bitbucket-username', 'laudna')
      Cookie.set('staff_user', 'doggo')
      setup({
        email: 'test@test.com',
        user: { avatarUrl: 'doggo.picz', name: 'doggo', username: 'doggo' },
        trackingMetadata: { ownerid: 'hello', staff: true },
      })
    })
    afterEach(() => {
      jest.clearAllMocks()
      Cookie.remove('bitbucket-username')
      Cookie.remove('staff_user')
    })

    it('Creates the expected user and key identified', () => {
      expect(mockIdentifyUser).lastCalledWith({
        name: 'doggo',
        email: 'test@test.com',
        key: 'hello-laudna',
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
      useIdentifyUser.mockImplementation(mockIdentifyUser)
      Cookie.set('gitlab-username', 'laudna')
      Cookie.set('staff_user', 'doggo')
      setup({
        email: 'test@test.com',
        user: { avatarUrl: 'doggo.picz', name: 'doggo', username: 'doggo' },
        trackingMetadata: { ownerid: 'hello', staff: true },
      })
    })
    afterEach(() => {
      jest.clearAllMocks()
      Cookie.remove('gitlab-username')
      Cookie.remove('staff_user')
    })
    it('Creates the expected user and key identified', () => {
      expect(mockIdentifyUser).lastCalledWith({
        name: 'doggo',
        email: 'test@test.com',
        key: 'hello-laudna',
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

  describe('In the unlikely event there is no cookie', () => {
    beforeEach(() => {
      useIdentifyUser.mockImplementation(mockIdentifyUser)
      setup({
        email: 'test@test.com',
        user: { avatarUrl: 'doggo.picz', name: 'doggo', username: 'doggo' },
        trackingMetadata: { ownerid: 'hello', staff: true },
      })
    })
    afterEach(() => jest.clearAllMocks())

    it('Creates the expected user and key identified', () => {
      expect(mockIdentifyUser).lastCalledWith({
        name: 'doggo',
        email: 'test@test.com',
        key: 'hello',
        avatar: 'doggo.picz',
        custom: {
          guest: false,
          student: false,
          username: 'doggo',
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
