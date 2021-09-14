import { render, screen } from '@testing-library/react'
import { withLDProvider } from 'launchdarkly-react-client-sdk'
import config from 'config'

import { withLaunchDarkly } from './index'

jest.mock('launchdarkly-react-client-sdk', () => ({
  __esModule: true,
  withLDProvider: jest.fn(),
}))

const original = config.LAUNCHDARKLY
const Dummy = () => <p>I rendered</p>

describe('withLaunchDarkly', () => {
  afterAll(() => (config.LAUNCHDARKLY = original))
  function setup(ldkey) {
    config.LAUNCHDARKLY = ldkey
    withLDProvider.mockImplementation(() => (C) => C)

    const Component = withLaunchDarkly(Dummy)
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
