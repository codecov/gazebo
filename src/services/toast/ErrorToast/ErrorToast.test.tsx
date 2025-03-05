import { render, screen } from '@testing-library/react'

import { ErrorToast } from './ErrorToast'

describe('ErrorToast', () => {
  it('renders the title', () => {
    render(<ErrorToast title="Error Title" content="Error Content" />)

    const title = screen.getByRole('heading', { name: /Error Title/ })
    expect(title).toBeInTheDocument()
    expect(title).toHaveClass('font-semibold')
  })

  it('renders the content', () => {
    render(<ErrorToast title="Error Title" content="Error Content" />)

    const content = screen.getByText(/Error Content/)
    expect(content).toBeInTheDocument()
  })
})
