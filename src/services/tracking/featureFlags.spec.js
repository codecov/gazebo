import { renderHook } from '@testing-library/react'
import Cookie from 'js-cookie'

import { useIdentifyUser } from 'shared/featureFlags'

import { useTrackFeatureFlags } from './featureFlags'

jest.mock('shared/featureFlags', () => ({
  useIdentifyUser: jest.fn(),
}))

describe('useTrackFeatureFlags', () => {
  const mockIdentifyUser = jest.fn()

  describe('normal use', () => {
    beforeEach(() => {
      useIdentifyUser.mockImplementation(mockIdentifyUser)
    })
    afterEach(() => {
      jest.clearAllMocks()
    })

    it('Creates the expected user and key identified', () => {
      renderHook(() =>
        useTrackFeatureFlags({
          email: 'test@test.com',
          user: {
            avatarUrl: 'http://127.0.0.1/avatar-url',
            name: 'doggo',
            username: 'doggo',
          },
          trackingMetadata: { ownerid: 'hello' },
        })
      )

      expect(mockIdentifyUser).toHaveBeenLastCalledWith({
        kind: 'user',
        name: 'doggo',
        email: 'test@test.com',
        key: 'hello',
        avatar: 'http://127.0.0.1/avatar-url',
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
      Cookie.set('staff_user', 'doggo')
    })
    afterEach(() => {
      jest.clearAllMocks()
      Cookie.remove('staff_user')
    })
    it('Creates the expected user and key identified', () => {
      renderHook(() =>
        useTrackFeatureFlags({
          email: 'test@test.com',
          user: {
            avatarUrl: 'http://127.0.0.1/avatar-url',
            name: 'doggo',
            username: 'doggo',
          },
          trackingMetadata: { ownerid: 'hello', staff: true },
        })
      )

      expect(mockIdentifyUser).toHaveBeenLastCalledWith({
        kind: 'user',
        name: 'doggo',
        email: 'test@test.com',
        key: 'impersonated',
        avatar: 'http://127.0.0.1/avatar-url',
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

  describe('impersonating on bitbucket', () => {
    beforeEach(() => {
      useIdentifyUser.mockImplementation(mockIdentifyUser)
      Cookie.set('staff_user', 'doggo')
    })
    afterEach(() => {
      jest.clearAllMocks()
      Cookie.remove('staff_user')
    })

    it('Creates the expected user and key identified', () => {
      renderHook(() =>
        useTrackFeatureFlags({
          email: 'test@test.com',
          user: {
            avatarUrl: 'http://127.0.0.1/avatar-url',
            name: 'doggo',
            username: 'doggo',
          },
          trackingMetadata: { ownerid: 'hello', staff: true },
        })
      )

      expect(mockIdentifyUser).toHaveBeenLastCalledWith({
        kind: 'user',
        name: 'doggo',
        email: 'test@test.com',
        key: 'impersonated',
        avatar: 'http://127.0.0.1/avatar-url',
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

  describe('impersonating on gitlab', () => {
    beforeEach(() => {
      useIdentifyUser.mockImplementation(mockIdentifyUser)
      Cookie.set('staff_user', 'doggo')
    })
    afterEach(() => {
      jest.clearAllMocks()
      Cookie.remove('staff_user')
    })
    it('Creates the expected user and key identified', () => {
      renderHook(() =>
        useTrackFeatureFlags({
          email: 'test@test.com',
          user: {
            avatarUrl: 'http://127.0.0.1/avatar-url',
            name: 'doggo',
            username: 'doggo',
          },
          trackingMetadata: { ownerid: 'hello', staff: true },
        })
      )

      expect(mockIdentifyUser).toHaveBeenLastCalledWith({
        kind: 'user',
        name: 'doggo',
        email: 'test@test.com',
        key: 'impersonated',
        avatar: 'http://127.0.0.1/avatar-url',
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
