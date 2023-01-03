import { render, screen } from '@testing-library/react'

import CoverageSelectIcon from './CoverageSelectIcon'

describe('CoverageSelectIcon', () => {
  it('renders uncovered alert icon', () => {
    render(<CoverageSelectIcon coverage="UNCOVERED" />)

    expect(screen.getByText('exclamation-triangle.svg')).toBeInTheDocument()
  })

  it('renders partial alert icon', () => {
    render(<CoverageSelectIcon coverage="PARTIAL" />)

    expect(screen.getByTestId('partial-icon')).toBeInTheDocument()
  })

  it('does not render icons on covered', () => {
    render(<CoverageSelectIcon coverage="COVERED" />)

    expect(screen.queryByTestId('partial-icon')).not.toBeInTheDocument()
    expect(
      screen.queryByText('exclamation-triangle.svg')
    ).not.toBeInTheDocument()
  })
})
