import { render, screen, waitFor } from '@testing-library/react'

import config from 'config'
import FlagLoader from './index'

jest.mock('./ExampleFlag', () => () => 'Self Hosted')
jest.mock('./flags/product-test-flag-gazebo-22-7-2022', () => () => 'Flagged')

describe('Example Flag loader', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })
  afterAll(() => (config.LAUNCHDARKLY = originalConfig))
  const originalConfig = config.LAUNCHDARKLY

  function setup(LD) {
    config.LAUNCHDARKLY = LD
    render(<FlagLoader />)
  }

  it('self hosted render', async () => {
    setup()
    await waitFor(() => {
      expect(screen.queryByText(/Self Hosted/)).toBeInTheDocument()
    })
  })

  it('flag render', async () => {
    setup('launch darkly client id')
    await waitFor(() => {
      expect(screen.queryByText(/Flagged/)).toBeInTheDocument()
    })
  })
})
