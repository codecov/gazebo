import { render, screen } from '@testing-library/react'

import SunburstChart from '.'

describe('SunburstChart', () => {
  it('renders', () => {
    render(<SunburstChart />)
    expect(screen.getByRole('img')).toBeInTheDocument()
  })
})
