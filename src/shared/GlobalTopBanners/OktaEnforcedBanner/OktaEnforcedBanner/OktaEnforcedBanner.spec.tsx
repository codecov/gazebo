import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route } from 'react-router-dom'

import OktaEnforcedBanner from './OktaEnforcedBanner'

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <MemoryRouter initialEntries={['/gh/codecov']}>
    <Route path="/:provider/:owner">{children}</Route>
  </MemoryRouter>
)

describe('OktaEnforcedBanner', () => {
  it('should render content', () => {
    render(<OktaEnforcedBanner />, { wrapper })

    const content = screen.getByText(
      /Not seeing private repositories for this organization?/
    )
    expect(content).toBeInTheDocument()
  })

  it('should render link', () => {
    render(<OktaEnforcedBanner />, { wrapper })

    const link = screen.getByRole('link', { name: /Authenticate/ })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/login/okta')
  })
})
