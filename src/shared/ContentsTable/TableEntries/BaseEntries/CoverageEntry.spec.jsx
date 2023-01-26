import { render, screen } from '@testing-library/react'

import CoverageEntry from './CoverageEntry'

describe('CoverageEntry', () => {
  it('displays the percentage', () => {
    render(<CoverageEntry percentCovered={12.1} />)

    const percent = screen.getByText('12.10%')
    expect(percent).toBeInTheDocument()
  })
})
