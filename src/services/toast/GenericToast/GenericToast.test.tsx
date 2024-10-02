import { render, screen } from '@testing-library/react'

import GenericToast from './GenericToast'

describe('GenericToast', () => {
  it('renders the title', () => {
    render(<GenericToast title="Cool Title" content="Cool content" />)

    const title = screen.getByRole('heading', { name: /Cool Title/ })
    expect(title).toBeInTheDocument()
    expect(title).toHaveClass('font-semibold')
  })

  it('renders the content', () => {
    render(<GenericToast title="Cool Title" content="Cool content" />)

    const content = screen.getByText(/Cool content/)
    expect(content).toBeInTheDocument()
  })
})
