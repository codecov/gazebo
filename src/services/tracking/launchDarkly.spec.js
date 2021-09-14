import { renderHook } from '@testing-library/react-hooks'
import { useLDClient } from 'launchdarkly-react-client-sdk'

import { useLaunchDarkly } from './launchDarkly'

jest.mock('launchdarkly-react-client-sdk', () => ({
  __esModule: true,
  useLDClient: jest.fn(),
}))

describe('useLaunchDarkly', () => {
  const mockIdentify = jest.fn()
  beforeEach(() => {
    useLDClient.mockImplementation(() => ({
      foo: 'bar',
      identify: mockIdentify,
    }))
    mockIdentify.mockReturnValue({ foo: 'bar', identify: mockIdentify })
  })
  function setup(user) {
    renderHook(() => useLaunchDarkly(user))
  }

  describe('logged in user', () => {
    afterEach(() => jest.clearAllMocks())
    beforeEach(() => {
      setup({
        email: 'test@test.com',
        user: { avatarUrl: 'doggo.picz', name: 'doggo' },
        trackingMetadata: { ownerid: 'hello' },
      })
    })
    it('correctly identifies user to Launch Darkly', () => {
      expect(mockIdentify).lastCalledWith({
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

  describe('not logged in', () => {
    afterEach(() => jest.clearAllMocks())
    beforeEach(() => {
      setup({
        guest: true,
      })
    })
    it('dont report guests for now.', () => {
      expect(mockIdentify).toBeCalledTimes(0)
    })
  })
})
