import { act, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Switch } from 'react-router-dom'

import { eventTracker } from 'services/events/events'

import GithubConfigBanner from './GithubConfigBanner'

vi.mock('services/events/events')

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

describe('GithubConfigBanner', () => {
  describe('when rendered with github provider', () => {
    it('renders banner title', () => {
      render(<GithubConfigBanner />, { wrapper: wrapper({ provider: 'gh' }) })

      const title = screen.getByText(/Codecov's GitHub app/)
      expect(title).toBeInTheDocument()
    })

    it('renders banner body', () => {
      render(<GithubConfigBanner />, {
        wrapper: wrapper({ provider: 'gh' }),
      })

      const body = screen.queryByText(
        /Enable status posts, comments, improved rate limit handling, and private repo management./
      )
      expect(body).toBeInTheDocument()
    })

    describe('and button is clicked', () => {
      it('tracks a Button Clicked event', async () => {
        render(<GithubConfigBanner />, {
          wrapper: wrapper({ provider: 'gh' }),
        })

        const title = screen.getByText(/Codecov's GitHub app/)
        expect(title).toBeInTheDocument()

        act(() => title.click())

        expect(eventTracker().track).toHaveBeenCalledWith({
          type: 'Button Clicked',
          properties: {
            buttonType: 'Install GitHub App',
            buttonLocation: 'Configure GitHub app banner',
          },
        })
      })
    })
  })

  describe('when rendered with other providers', () => {
    it('does not render banner title', () => {
      render(<GithubConfigBanner />, { wrapper: wrapper({ provider: 'gl' }) })

      const title = screen.queryByText(/Configure Codecov's GitHub app/)
      expect(title).not.toBeInTheDocument()
    })

    it('does not render banner body', () => {
      render(<GithubConfigBanner />, {
        wrapper: wrapper({ provider: 'gl' }),
      })

      const body = screen.queryByText(
        /Enable status posts, comments, improved rate limit handling, and private repo management./
      )
      expect(body).not.toBeInTheDocument()
    })
  })
})
