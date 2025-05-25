/* eslint-disable no-restricted-imports */
import { render, renderHook, screen, waitFor } from '@testing-library/react'

import config from 'config'

import { useFlags, useIdentifyUser, withFeatureFlagProvider } from './index'

const mocks = vi.hoisted(() => ({
  withLDProvider: vi.fn(),
  useLDClient: vi.fn(),
  useFlags: vi.fn(),
}))

vi.mock('launchdarkly-react-client-sdk', async () => {
  const actual = await vi.importActual('launchdarkly-react-client-sdk')
  return {
    ...actual,
    __esModule: true,
    withLDProvider: mocks.withLDProvider,
    useLDClient: mocks.useLDClient,
    useFlags: mocks.useFlags,
  }
})

const Dummy = () => <p>I rendered</p>

describe('withFeatureFlagProvider', () => {
  afterAll(() => {
    config.LAUNCHDARKLY = undefined
  })

  function setup(ldkey?: string) {
    config.LAUNCHDARKLY = ldkey
    mocks.withLDProvider.mockImplementation(() => (C: any) => C)

    const Component = withFeatureFlagProvider(Dummy)
    render(<Component />)
  }

  describe('env has REACT_APP_LAUNCHDARKLY', () => {
    afterEach(() => {
      vi.clearAllMocks()
      config.LAUNCHDARKLY = undefined
    })

    it('Apply withLDProvider', () => {
      setup('test')

      expect(mocks.withLDProvider).toHaveBeenCalledTimes(1)
      expect(screen.getByText(/I rendered/)).toBeTruthy()
    })
  })

  describe('env does not have REACT_APP_LAUNCHDARKLY', () => {
    afterEach(() => {
      vi.clearAllMocks()
      config.LAUNCHDARKLY = undefined
    })

    it('Does not apply withLDProvider', () => {
      setup()

      expect(mocks.withLDProvider).toHaveBeenCalledTimes(0)
      expect(screen.getByText(/I rendered/)).toBeTruthy()
    })
  })
})

describe('useFlags', () => {
  afterAll(() => {
    config.LAUNCHDARKLY = undefined
  })

  function setup(ldkey?: string) {
    config.LAUNCHDARKLY = ldkey
    mocks.useFlags.mockImplementation(() => ({ foo: 'fiz' }))
  }

  describe('env has REACT_APP_LAUNCHDARKLY', () => {
    afterEach(() => {
      vi.clearAllMocks()
      config.LAUNCHDARKLY = undefined
    })

    it('returns a launch darkly flag', () => {
      setup('key')

      const { result } = renderHook(() => useFlags({ foo: 'bar' }))
      expect(result.current).toStrictEqual({ foo: 'fiz' })
    })
  })

  describe('env does not have REACT_APP_LAUNCHDARKLY', () => {
    afterEach(() => {
      vi.clearAllMocks()
      config.LAUNCHDARKLY = undefined
    })

    it('Return fallback value', async () => {
      setup(undefined)
      const { result } = renderHook(() => useFlags({ foo: 'bar' }))

      await waitFor(() => expect(result.current).toStrictEqual({ foo: 'bar' }))
    })

    it('Throws an error if no fallback is provided', async () => {
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
      setup(undefined)

      renderHook(() => useFlags())

      await waitFor(() =>
        expect(spy).toHaveBeenLastCalledWith(
          'Warning! Self hosted build is missing a default feature flag value.'
        )
      )
    })
  })
})

describe('useIdentifyUser', () => {
  function setup(ldkey?: string) {
    const mockIdentify = vi.fn()
    config.LAUNCHDARKLY = ldkey

    mocks.useLDClient.mockImplementation(() => ({
      identify: mockIdentify,
    }))

    return { mockIdentify }
  }

  afterEach(() => {
    vi.clearAllMocks()
    config.LAUNCHDARKLY = undefined
  })

  describe('env has REACT_APP_LAUNCHDARKLY', () => {
    it('emits a new user to launch darkly', () => {
      const { mockIdentify } = setup('key')

      renderHook(() =>
        useIdentifyUser({ name: 'doggo', key: 'hello', avatar: 'doggo.picz' })
      )

      expect(mockIdentify).toHaveBeenLastCalledWith({
        name: 'doggo',
        key: 'hello',
        avatar: 'doggo.picz',
      })
    })

    it('guest users are not reported', () => {
      const { mockIdentify } = setup('key')

      renderHook(() => useIdentifyUser({ key: 'abc', guest: true }))

      expect(mockIdentify).toHaveBeenCalledTimes(0)
    })
  })

  describe('env does not have REACT_APP_LAUNCHDARKLY', () => {
    it('never phones home', () => {
      const { mockIdentify } = setup(undefined)

      renderHook(() => useIdentifyUser({ key: 'abc' }))

      expect(mockIdentify).toHaveBeenCalledTimes(0)
    })
  })
})
