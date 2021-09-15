import { render, screen } from '@testing-library/react'

import ExampleFlag from './ExampleFlag'

// Needs to be tested because I'm long term code.
describe('Example Flag', () => {
  function setup() {
    render(<ExampleFlag />)
  }

  it('self hosted render', () => {
    // Example doesnt render anything
    setup()
    expect(screen.queryByText(/Self Hosted/)).not.toBeInTheDocument()
  })
})
