import { render, screen } from '@testing-library/react'

import SilentNetworkError from './SilentNetworkErrorWrapper'

describe('SilentNetworkErrorWrapper', () => {
  function setup() {
    render(<SilentNetworkError>Hi</SilentNetworkError>)
  }

  it('renders children', async () => {
    setup()

    const Hello = await screen.findByText(/Hi/)
    expect(Hello).toBeInTheDocument()
  })
})
