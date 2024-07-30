import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route } from 'react-router-dom'

import OktaEnforcedBanner from './OktaEnforcedBanner'

const wrapper =
  (
    initialEntries = ['/gh/codecov'],
    path = '/:provider/:owner'
  ): React.FC<React.PropsWithChildren> =>
  ({ children }) => (
    <MemoryRouter initialEntries={initialEntries}>
      <Route path={path}>{children}</Route>
    </MemoryRouter>
  )

describe('OktaEnforcedBanner', () => {
  it('should return null if owner is not provided', () => {
    const { container } = render(<OktaEnforcedBanner />, {
      wrapper: wrapper(['/gh/'], '/:provider'),
    })

    expect(container).toBeEmptyDOMElement()
  })

  it('should reflect current organization', () => {
    render(<OktaEnforcedBanner />, { wrapper: wrapper() })

    const content = screen.getByText(
      /Single sign-on has been enabled for codecov./
    )
    expect(content).toBeInTheDocument()
  })

  it('should render content', () => {
    render(<OktaEnforcedBanner />, { wrapper: wrapper() })

    const content = screen.getByText(
      /Not seeing private repositories for this organization?/
    )
    expect(content).toBeInTheDocument()
  })

  it('should render link', () => {
    render(<OktaEnforcedBanner />, { wrapper: wrapper() })

    const link = screen.getByRole('link', { name: /Authenticate/ })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/login/okta/gh/codecov')
  })
})
