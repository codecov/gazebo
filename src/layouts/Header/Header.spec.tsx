import { render, screen } from '@testing-library/react'

import Header from './Header'

describe('placeholder new header', () => {
  it('renders', async () => {
    render(<Header />)

    const header = await screen.findByText('New header')
    expect(header).toBeInTheDocument()
  })
})
