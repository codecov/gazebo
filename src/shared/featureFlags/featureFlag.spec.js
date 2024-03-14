/* eslint-disable no-restricted-imports */
import { render, renderHook, screen, waitFor } from '@testing-library/react'
import {
  useLDClient,
  useFlags as useLDFlags,
  withLDProvider,
} from 'launchdarkly-react-client-sdk'

import config from 'config'

import { useFlags, useIdentifyUser, withFeatureFlagProvider } from './index'

jest.mock('launchdarkly-react-client-sdk', () => ({
  __esModule: true,
  withLDProvider: jest.fn(),
  useLDClient: jest.fn(),
  useFlags: jest.fn(),
}))

const Dummy = () => <p>I rendered</p>

describe('withFeatureFlagProvider', () => {
  afterAll(() => (config.LAUNCHDARKLY = undefined))
  function setup(ldkey) {
    config.LAUNCHDARKLY = ldkey
    withLDProvider.mockImplementation(() => (C) => C)

    const Component = withFeatureFlagProvider(Dummy)
    render(<Component />)
  }

  describe('env has REACT_APP_LAUNCHDARKLY', () => {
    afterEach(() => jest.clearAllMocks())
    beforeEach(() => setup('test'))
    it(`Apply's withLDProvider`, () => {
      expect(withLDProvider).toHaveBeenCalledTimes(1)
      expect(screen.getByText(/I rendered/)).toBeTruthy()
    })
  })

  describe('env does not have REACT_APP_LAUNCHDARKLY', () => {
    afterEach(() => jest.clearAllMocks())
    beforeEach(() => setup())
    it('Does not apply withLDProvider', () => {
      expect(withLDProvider).toHaveBeenCalledTimes(0)
      expect(screen.getByText(/I rendered/)).toBeTruthy()
    })
  })
})

describe('useFlags', () => {
  afterAll(() => (config.LAUNCHDARKLY = undefined))
  function setup(ldkey) {
    config.LAUNCHDARKLY = ldkey
    useLDFlags.mockImplementation(() => ({ foo: 'fiz' }))
  }

  describe('env has REACT_APP_LAUNCHDARKLY', () => {
    afterEach(() => jest.clearAllMocks())
    beforeEach(() => {
      setup('key')
    })
    it('returns a launch darkly flag', () => {
      const { result } = renderHook(() => useFlags({ foo: 'bar' }))
      expect(result.current).toStrictEqual({ foo: 'fiz' })
    })
  })

  describe('env does not have REACT_APP_LAUNCHDARKLY', () => {
    afterEach(() => jest.clearAllMocks())
    it('Return fallback value', async () => {
      setup(undefined)
      const { result } = renderHook(() => useFlags({ foo: 'bar' }))

      await waitFor(() => expect(result.current).toStrictEqual({ foo: 'bar' }))
    })

    it('Throws an error if no fallback is provided', async () => {
      const spy = jest.spyOn(console, 'error').mockImplementation()
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
  const mockIdentify = jest.fn()
  afterAll(() => (config.LAUNCHDARKLY = undefined))
  function setup(ldkey) {
    config.LAUNCHDARKLY = ldkey

    useLDClient.mockImplementation(() => ({
      identify: mockIdentify,
    }))
  }

  describe('env has REACT_APP_LAUNCHDARKLY', () => {
    afterEach(() => jest.clearAllMocks())
    it('emits a new user to launch darkly', () => {
      setup('borkbork')

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
      setup({ name: 'doggo', key: 'hello', guest: true }, 'woofwoof')
      expect(mockIdentify).toHaveBeenCalledTimes(0)
    })
  })

  describe('env does not have REACT_APP_LAUNCHDARKLY', () => {
    afterEach(() => jest.clearAllMocks())
    it('never phones home', () => {
      renderHook(() => useIdentifyUser({ key: 'abc' }))

      expect(mockIdentify).toHaveBeenCalledTimes(0)
    })
  })
})
