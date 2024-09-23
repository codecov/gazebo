import { render, screen } from '@testing-library/react'

import { AdminAuthorizationBanner } from './AdminAuthorizationBanner'

describe('AdminAuthorizationBanner', () => {
  it('should render heading', () => {
    render(<AdminAuthorizationBanner />)
    const header = screen.getByRole('heading', {
      name: /Admin authorization required/,
    })
    expect(header).toBeInTheDocument()
  })

  it('should render content', () => {
    render(<AdminAuthorizationBanner />)
    const content = screen.getByText(
      /Requires organization administrator privileges. Please contact your GitHub administrator if you need access to configure Okta integration./
    )
    expect(content).toBeInTheDocument()
  })
})
