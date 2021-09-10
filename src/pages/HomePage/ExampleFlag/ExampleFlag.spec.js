import { render, screen } from '@testing-library/react'

import ExampleFlag from './ExampleFlag'

// I need to be tested because I'm long term code.
describe('Example Flag', () => {
  function setup(LD) {
    render(<ExampleFlag />)
  }

  it('self hosted render', async () => {
    setup()
    expect(screen.queryByText(/Self Hosted/)).not.toBeInTheDocument()
  })
})
