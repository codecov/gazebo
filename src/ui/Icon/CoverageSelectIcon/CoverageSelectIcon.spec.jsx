import { render, screen } from '@testing-library/react'

import CoverageSelectIcon from './CoverageSelectIcon'

describe('CoverageSelectIcon', () => {
  it('renders uncovered alert icon', () => {
    render(<CoverageSelectIcon coverage="UNCOVERED" />)

    const icon = screen.getByText('exclamation-triangle.svg')
    expect(icon).toBeInTheDocument()
  })

  it('renders partial alert icon', () => {
    render(<CoverageSelectIcon coverage="PARTIAL" />)

    const icon = screen.getByTestId('partial-icon')
    expect(icon).toBeInTheDocument()
  })

  it('does not render icons on covered', () => {
    render(<CoverageSelectIcon coverage="COVERED" />)

    const partialIcon = screen.queryByTestId('partial-icon')
    expect(partialIcon).not.toBeInTheDocument()

    const exclamationTriangle = screen.queryByText('exclamation-triangle.svg')
    expect(exclamationTriangle).not.toBeInTheDocument()
  })

  it('does not render icons on blank', () => {
    render(<CoverageSelectIcon coverage="BLANK" />)

    const partialIcon = screen.queryByTestId('partial-icon')
    expect(partialIcon).not.toBeInTheDocument()

    const exclamationTriangle = screen.queryByText('exclamation-triangle.svg')
    expect(exclamationTriangle).not.toBeInTheDocument()
  })
})
