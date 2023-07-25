import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Switch } from 'react-router-dom'

import GitHubHelpBanner from './GitHubHelpBanner'

const wrapper =
  ({ provider = 'gh' }) =>
  ({ children }) => {
    return (
      <MemoryRouter initialEntries={[`/${provider}/codecov/analytics/new`]}>
        <Switch>
          <Route path="/:provider/:owner/:repo/new">{children}</Route>
        </Switch>
      </MemoryRouter>
    )
  }

describe('GitHubHelpBanner', () => {
  describe('when rendered with github provider', () => {
    it('renders banner title', () => {
      render(<GitHubHelpBanner />, { wrapper: wrapper({ provider: 'gh' }) })

      const title = screen.getByText(/Don't see your org?/)
      expect(title).toBeInTheDocument()
    })

    it('renders banner body', () => {
      render(<GitHubHelpBanner />, {
        wrapper: wrapper({ provider: 'gh' }),
      })

      const body = screen.getByText(/you can install app instantly./)
      expect(body).toBeInTheDocument()
    })

    it('renders banner body with correct links', () => {
      render(<GitHubHelpBanner />, {
        wrapper: wrapper({ provider: 'gh' }),
      })

      const link = screen.getByRole('link', { name: /GitHub app is required/ })
      expect(link).toHaveAttribute('href', 'https://github.com/apps/codecov')
    })
  })

  describe('when rendered with other providers', () => {
    it('does not render banner title', () => {
      render(<GitHubHelpBanner />, { wrapper: wrapper({ provider: 'gl' }) })

      const title = screen.queryByText(/Don't see your org?/)
      expect(title).not.toBeInTheDocument()
    })

    it('does not render banner body', () => {
      render(<GitHubHelpBanner />, {
        wrapper: wrapper({ provider: 'gl' }),
      })

      const body = screen.queryByText(/you can install app instantly./)
      expect(body).not.toBeInTheDocument()
    })
  })
})
