import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Switch } from 'react-router-dom'

import GithubConfigBanner from './GithubConfigBanner'

describe('GithubConfigBanner', () => {
  describe('when rendered with github provider', () => {
    it('renders banner title', () => {
      render(
        <MemoryRouter initialEntries={['/gh/codecov/analytics/new']}>
          <Switch>
            <Route path="/:provider/:owner/:repo/new">
              <GithubConfigBanner />
            </Route>
          </Switch>
        </MemoryRouter>
      )

      const title = screen.queryByText(/Install Codecov GitHub app/)
      expect(title).toBeInTheDocument()
    })

    it('renders banner body', () => {
      render(
        <MemoryRouter initialEntries={['/gh/codecov/analytics/new']}>
          <Switch>
            <Route path="/:provider/:owner/:repo/new">
              <GithubConfigBanner />
            </Route>
          </Switch>
        </MemoryRouter>
      )

      const body = screen.queryByText(
        /Once installed, you will not need to set a/
      )
      expect(body).toBeInTheDocument()
    })
  })

  describe('when rendered with other providers', () => {
    it('does not render banner title', () => {
      render(
        <MemoryRouter initialEntries={['/gl/codecov/analytics/new']}>
          <Switch>
            <Route path="/:provider/:owner/:repo/new">
              <GithubConfigBanner />
            </Route>
          </Switch>
        </MemoryRouter>
      )

      const title = screen.queryByText(/Install Codecov GitHub app/)
      expect(title).not.toBeInTheDocument()
    })

    it('does not render banner body', () => {
      render(
        <MemoryRouter initialEntries={['/gl/codecov/analytics/new']}>
          <Switch>
            <Route path="/:provider/:owner/:repo/new">
              <GithubConfigBanner />
            </Route>
          </Switch>
        </MemoryRouter>
      )

      const body = screen.queryByText(
        /Once installed, you will not need to set a/
      )
      expect(body).not.toBeInTheDocument()
    })
  })
})
