import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route } from 'react-router'

import GitHubRateLimitExceededBanner from './GitHubRateLimitExceededBanner'

const wrapper =
  (initialEntry = '/gh'): React.FC<React.PropsWithChildren> =>
  ({ children }) => (
    <MemoryRouter initialEntries={[initialEntry]}>
      <Route path="/:provider">{children}</Route>
    </MemoryRouter>
  )

describe('GitHubRateLimitExceededBanner', () => {
  describe('provider is GH', () => {
    it('renders the banner', () => {
      render(<GitHubRateLimitExceededBanner />, {
        wrapper: wrapper('/gh'),
      })

      const title = screen.getByText('Rate limit exceeded')
      expect(title).toBeInTheDocument()

      const description = screen.getByText(/Unable to calculate/)
      expect(description).toBeInTheDocument()

      const link = screen.getByRole('link', { name: 'Github documentation.' })
      expect(link).toBeInTheDocument()
      expect(link).toHaveAttribute(
        'href',
        'https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api'
      )
    })
  })

  describe('provider is not GH', () => {
    it('does not render', () => {
      const { container } = render(<GitHubRateLimitExceededBanner />, {
        wrapper: wrapper('/bb'),
      })

      expect(container).toBeEmptyDOMElement()
    })
  })
})
