import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Switch } from 'react-router-dom'

import GithubConfigBanner from './GithubConfigBanner'

describe('GithubConfigBanner', () => {
  function setup({ privateRepo }) {
    render(
      <MemoryRouter initialEntries={['/gh/codecov/analytics/new']}>
        <Switch>
          <Route path="/:provider/:owner/:repo/new">
            <GithubConfigBanner privateRepo={privateRepo} />
          </Route>
        </Switch>
      </MemoryRouter>
    )
  }

  describe('when rendered with private repo', () => {
    beforeEach(() => {
      setup({ privateRepo: true })
    })

    it('renders banner title', () => {
      const title = screen.queryByText(/Install Codecov GitHub app/)
      expect(title).toBeInTheDocument()
    })

    it('renders banner body', () => {
      const body = screen.queryByText(/Once installed, you are done!/)
      expect(body).toBeInTheDocument()
    })
  })

  describe('when rendered with public repo', () => {
    beforeEach(() => {
      setup({ privateRepo: false })
    })

    it('does not render banner title', () => {
      const title = screen.queryByText(/Install Codecov GitHub app/)
      expect(title).not.toBeInTheDocument()
    })

    it('does not render banner body', () => {
      const body = screen.queryByText(/Once installed, you are done!/)
      expect(body).not.toBeInTheDocument()
    })
  })
})
