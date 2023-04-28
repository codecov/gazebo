/* eslint-disable no-restricted-imports */
import { render, screen } from '@testing-library/react'
import { renderHook } from '@testing-library/react-hooks'
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
      expect(withLDProvider).toBeCalledTimes(1)
      expect(screen.getByText(/I rendered/)).toBeTruthy()
    })
  })

  describe('env does not have REACT_APP_LAUNCHDARKLY', () => {
    afterEach(() => jest.clearAllMocks())
    beforeEach(() => setup())
    it('Does not apply withLDProvider', () => {
      expect(withLDProvider).toBeCalledTimes(0)
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
    it('Return fallback value', () => {
      setup()
      const { result } = renderHook(() => useFlags({ foo: 'bar' }))
      expect(result.current).toStrictEqual({ foo: 'bar' })
    })
    it('Throws an error if no fallback is provided', () => {
      const spy = jest.spyOn(console, 'error').mockImplementation()
      setup()
      renderHook(() => useFlags())

      expect(spy).toHaveBeenLastCalledWith(
        'Warning! Self hosted build is missing a default feature flag value.'
      )
    })
  })
})

describe('useIdentifyUser', () => {
  afterAll(() => (config.LAUNCHDARKLY = undefined))
  function setup(ldkey) {
    const mockIdentify = jest.fn()
    config.LAUNCHDARKLY = ldkey

    useLDClient.mockImplementation(() => ({
      identify: mockIdentify,
    }))

    return { mockIdentify }
  }

  describe('env has REACT_APP_LAUNCHDARKLY', () => {
    afterEach(() => jest.clearAllMocks())
    it('emits a new user to launch darkly', () => {
      const { mockIdentify } = setup('borkbork')
      renderHook(() =>
        useIdentifyUser({ name: 'doggo', key: 'hello', avatar: 'doggo.picz' })
      )

      expect(mockIdentify).lastCalledWith({
        name: 'doggo',
        key: 'hello',
        avatar: 'doggo.picz',
      })
    })

    it('guest users are not reported', () => {
      const { mockIdentify } = setup('woofwoof')
      renderHook(() =>
        useIdentifyUser({ name: 'doggo', key: 'hello', guest: true })
      )

      expect(mockIdentify).toBeCalledTimes(0)
    })
  })

  describe('env does not have REACT_APP_LAUNCHDARKLY', () => {
    afterEach(() => jest.clearAllMocks())
    it('never phones home', () => {
      const { mockIdentify } = setup()
      renderHook(() => useIdentifyUser({ key: 'abc' }))

      expect(mockIdentify).toBeCalledTimes(0)
    })
  })
})
