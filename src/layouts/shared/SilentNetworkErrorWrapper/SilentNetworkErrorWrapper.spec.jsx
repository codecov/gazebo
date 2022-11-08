import { render, screen } from '@testing-library/react'

import SilentNetworkError from './SilentNetworkErrorWrapper'

describe('SilentNetworkErrorWrapper', () => {
  function setup(data) {
    render(<SilentNetworkError>Hi</SilentNetworkError>)
  }

  beforeEach(() => {
    setup()
  })

  it('renders children', async () => {
    const Hello = await screen.findByText(/Hi/)
    expect(Hello).toBeInTheDocument()
  })
})
