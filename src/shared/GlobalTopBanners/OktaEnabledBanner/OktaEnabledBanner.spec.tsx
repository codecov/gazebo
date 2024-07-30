import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route } from 'react-router-dom'

import OktaEnabledBanner from './OktaEnabledBanner'

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

describe('OktaEnabledBanner', () => {
  it('should return null if owner is not provided', () => {
    const { container } = render(<OktaEnabledBanner />, {
      wrapper: wrapper(['/gh/'], '/:provider'),
    })

    expect(container).toBeEmptyDOMElement()
  })

  it('should reflect current organization', () => {
    render(<OktaEnabledBanner />, { wrapper: wrapper() })

    const content = screen.getByText(
      /Single sign-on has been enabled for codecov./
    )
    expect(content).toBeInTheDocument()
  })

  it('should render content', () => {
    render(<OktaEnabledBanner />, { wrapper: wrapper() })

    const content = screen.getByText(
      / this will be the only way to access private repositories for this organization./
    )
    expect(content).toBeInTheDocument()
  })

  it('should render link', () => {
    render(<OktaEnabledBanner />, { wrapper: wrapper() })

    const link = screen.getByRole('link', { name: /Authenticate/ })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/login/okta/gh/codecov')
  })
})
