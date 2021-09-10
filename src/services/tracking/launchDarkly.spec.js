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
    // useLDClient.mockReturnValue({ foo: 'bar', identify: mockIdentify })
  })
  afterEach(() => jest.clearAllMocks())
  function setup(user) {
    renderHook(() => useLaunchDarkly(user))
  }

  it('correctly identifies user to Launch Darkly', async () => {
    setup({ trackingMetadata: { ownerid: 'hello' } })
    expect(mockIdentify).lastCalledWith({})
  })
})
