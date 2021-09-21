import { renderHook } from '@testing-library/react-hooks'
import { useIdentifyUser } from 'shared/featureFlags'

import { useTrackFeatureFlags } from './featureFlags'

jest.mock('shared/featureFlags', () => ({
  useIdentifyUser: jest.fn(),
}))

describe('useTrackFeatureFlags', () => {
  const mockUdentifyUser = jest.fn()
  beforeEach(() => {
    useIdentifyUser.mockImplementation(mockUdentifyUser)
    setup({
      email: 'test@test.com',
      user: { avatarUrl: 'doggo.picz', name: 'doggo' },
      trackingMetadata: { ownerid: 'hello' },
    })
  })
  afterEach(() => jest.clearAllMocks())

  function setup(user) {
    renderHook(() => useTrackFeatureFlags(user))
  }

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
