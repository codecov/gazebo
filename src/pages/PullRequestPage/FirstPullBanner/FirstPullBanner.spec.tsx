import { render, screen } from '@testing-library/react'

import FirstPullBanner from './FirstPullBanner'

describe('FirstPullBanner', () => {
  it('should render', () => {
    render(<FirstPullBanner />)

    const header = screen.getByRole('heading', { name: /Welcome to Codecov/ })
    expect(header).toBeInTheDocument()

    const content = screen.getByText(/Once merged to your default branch/)
    expect(content).toBeInTheDocument()
  })

  it('should not render if not first pull', () => {
    const { container } = render(<FirstPullBanner />)

    expect(container).toBeEmptyDOMElement()
  })

  it('should not render if state not open', () => {
    const { container } = render(<FirstPullBanner />)

    expect(container).toBeEmptyDOMElement()
  })
})
