import { render, screen } from '@testing-library/react'

import { SuccessToast } from './SuccessToast'

describe('SuccessToast', () => {
  it('renders the title', () => {
    render(<SuccessToast title="Success Title" content="Success Content" />)

    const title = screen.getByRole('heading', { name: /Success Title/ })
    expect(title).toBeInTheDocument()
    expect(title).toHaveClass('font-semibold')
  })

  it('renders the content', () => {
    render(<SuccessToast title="Success Title" content="Success Content" />)

    const content = screen.getByText(/Success Content/)
    expect(content).toBeInTheDocument()
  })
})
