import { render, screen } from '@testing-library/react'

import CoverageTrendWrapper from './CoverageTrendWrapper'
jest.mock('./CoverageTrend', () => () => 'CoverageTrend')

describe('Flags Card', () => {
  function setup() {
    render(<CoverageTrendWrapper />)
  }

  beforeEach(() => {
    setup()
  })

  it('renders', async () => {
    const CoverageTrendComponent = await screen.findByText(/CoverageTrend/)
    expect(CoverageTrendComponent).toBeInTheDocument()
  })
})
