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
  let hookData
  afterAll(() => (config.LAUNCHDARKLY = undefined))
  function setup(fallback, ldkey) {
    config.LAUNCHDARKLY = ldkey
    useLDFlags.mockImplementation(() => ({ foo: 'fiz' }))

    hookData = renderHook(() => useFlags(fallback))
  }

  describe('env has REACT_APP_LAUNCHDARKLY', () => {
    afterEach(() => jest.clearAllMocks())
    beforeEach(() => {
      setup({ foo: 'bar' }, 'key')
    })
    it('returns a launch darkly flag', () => {
      expect(hookData.result.current).toStrictEqual({ foo: 'fiz' })
    })
  })

  describe('env does not have REACT_APP_LAUNCHDARKLY', () => {
    afterEach(() => jest.clearAllMocks())
    it('Return fallback value', () => {
      setup({ foo: 'bar' })
      expect(hookData.result.current).toStrictEqual({ foo: 'bar' })
    })
    it('Throws an error if no fallback is provided', () => {
      const spy = jest.spyOn(console, 'error').mockImplementation()
      setup()

      expect(spy).toHaveBeenLastCalledWith(
        'Warning! Self hosted build is missing a default feature flag value.'
      )
    })
  })
})

describe('useIdentifyUser', () => {
  const mockIdentify = jest.fn()
  afterAll(() => (config.LAUNCHDARKLY = undefined))
  function setup(user, ldkey) {
    config.LAUNCHDARKLY = ldkey

    useLDClient.mockImplementation(() => ({
      identify: mockIdentify,
    }))

    renderHook(() => useIdentifyUser(user))
  }

  describe('env has REACT_APP_LAUNCHDARKLY', () => {
    afterEach(() => jest.clearAllMocks())
    it('emits a new user to launch darkly', () => {
      setup({ name: 'doggo', key: 'hello', avatar: 'doggo.picz' }, 'borkbork')
      expect(mockIdentify).lastCalledWith({
        name: 'doggo',
        key: 'hello',
        avatar: 'doggo.picz',
      })
    })

    it('guest users are not reported', () => {
      setup({ name: 'doggo', key: 'hello', guest: true }, 'woofwoof')
      expect(mockIdentify).toBeCalledTimes(0)
    })
  })

  describe('env does not have REACT_APP_LAUNCHDARKLY', () => {
    afterEach(() => jest.clearAllMocks())
    beforeEach(() => setup({ key: 'abc' }))
    it('never phones home', () => {
      expect(mockIdentify).toBeCalledTimes(0)
    })
  })
})
