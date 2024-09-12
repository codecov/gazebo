import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route } from 'react-router-dom'

import OktaErrorBanners from './OktaErrorBanners'

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

describe('OktaErrorBanners', () => {
  it('should return null if owner is not provided', () => {
    const { container } = render(<OktaErrorBanners />, {
      wrapper: wrapper(['/gh/'], '/:provider'),
    })

    expect(container).toBeEmptyDOMElement()
  })

  it('should return null if error is not provided', () => {
    const { container } = render(<OktaErrorBanners />, {
      wrapper: wrapper(['/gh/codecov']),
    })

    expect(container).toBeEmptyDOMElement()
  })

  it('should render error message for invalid_request', () => {
    render(<OktaErrorBanners />, {
      wrapper: wrapper(['/gh/codecov?error=invalid_request']),
    })

    const content = screen.getByText(
      /Invalid request: The request parameters aren't valid. Please try again or contact support./
    )
    expect(content).toBeInTheDocument()
  })

  it('should render error message for unauthorized_client', () => {
    render(<OktaErrorBanners />, {
      wrapper: wrapper(['/gh/codecov?error=unauthorized_client']),
    })

    const content = screen.getByText(
      /Unauthorized client: The client isn't authorized to request an authorization code using this method. Please reach out to your administrator./
    )
    expect(content).toBeInTheDocument()
  })

  it('should render error message for access_denied', () => {
    render(<OktaErrorBanners />, {
      wrapper: wrapper(['/gh/codecov?error=access_denied']),
    })

    const content = screen.getByText(
      /The resource owner or authorization server denied the request/
    )
    expect(content).toBeInTheDocument()
  })

  it('should render dismiss button', () => {
    render(<OktaErrorBanners />, {
      wrapper: wrapper(['/gh/codecov?error=invalid_request']),
    })

    const dismissButton = screen.getByRole('button', { name: /Dismiss/ })
    expect(dismissButton).toBeInTheDocument()
  })
})
