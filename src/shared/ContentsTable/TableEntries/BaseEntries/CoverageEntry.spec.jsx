import { render, screen } from '@testing-library/react'

import CoverageEntry from './CoverageEntry'

describe('CoverageEntry', () => {
  function setup() {
    render(<CoverageEntry percentCovered={12.1} />)
  }

  beforeEach(() => {
    setup()
  })

  it('displays the percentage', () => {
    expect(screen.getByText('12.10%')).toBeInTheDocument()
  })
})
