import { render, screen } from 'custom-testing-library'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import BotErrorBanner from './BotErrorBanner.jsx'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
})

const wrapper =
  ({ provider }) =>
  ({ children }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[`/${provider}/codecov`]}>
        <Route path="/:provider/:owner">{children}</Route>
      </MemoryRouter>
    </QueryClientProvider>
  )

const defaultProps = { botErrorsCount: 2 }

const server = setupServer()
beforeAll(() => {
  server.listen()
})

afterEach(() => {
  queryClient.clear()
  server.resetHandlers()
})

afterAll(() => {
  server.close()
})

describe('BotErrorBanner', () => {
  function setup({ hasGithubApp } = { hasGithubApp: false }) {
    server.use(
      graphql.query('DetailOwner', () => {
        return HttpResponse.json({
          data: {
            owner: {
              ownerid: 1,
              username: 'codecov',
              avatarUrl: 'http://127.0.0.1/avatar-url',
              isCurrentUserPartOfOrg: true,
              isAdmin: true,
              isOnlyUsingSentryApp: false,
              hasGithubApp,
              externalId: 'external-id',
            },
          },
        })
      })
    )
  }

  describe('when rendered with gh provider and the app installed', () => {
    it('renders heading of banner', async () => {
      setup({ hasGithubApp: true })

      render(<BotErrorBanner {...defaultProps} />, {
        wrapper: wrapper({ provider: 'gh' }),
      })

      const title = await screen.findByText(
        'There was an issue with the GitHub app'
      )
      expect(title).toBeInTheDocument()
    })

    it('renders content', async () => {
      setup({ hasGithubApp: true })

      render(<BotErrorBanner {...defaultProps} />, {
        wrapper: wrapper({ provider: 'gh' }),
      })

      const content = await screen.findByText(
        /Please uninstall and reinstall the GH app to successfully sync Codecov with your account./
      )
      expect(content).toBeInTheDocument()
    })
  })

  describe('when rendered with gh provider and no app installed', () => {
    beforeEach(() => {
      setup({ hasGithubApp: false })
    })

    it('renders heading of banner', () => {
      render(<BotErrorBanner {...defaultProps} />, {
        wrapper: wrapper({ provider: 'gh' }),
      })

      const title = screen.getByRole('link', { name: /Team bot/ })
      expect(title).toBeInTheDocument()

      expect(title).toHaveAttribute(
        'href',
        'https://docs.codecov.com/docs/team-bot'
      )
    })

    it('renders content', () => {
      render(<BotErrorBanner {...defaultProps} />, {
        wrapper: wrapper({ provider: 'gh' }),
      })

      const content = screen.getByText(
        /The bot posts the coverage report comment on pull requests. If you're using GitHub, the best way to integrate with Codecov.io is to Install/
      )

      expect(content).toBeInTheDocument()
    })
  })

  describe('when rendered with gl provider', () => {
    beforeEach(() => {
      setup()
    })

    it('renders heading of banner', () => {
      render(<BotErrorBanner {...defaultProps} />, {
        wrapper: wrapper({ provider: 'gl' }),
      })

      const title = screen.getByRole('link', { name: /Team bot/ })
      expect(title).toBeInTheDocument()

      expect(title).toHaveAttribute(
        'href',
        'https://docs.codecov.com/docs/team-bot'
      )
    })

    it('renders content', () => {
      render(<BotErrorBanner {...defaultProps} />, {
        wrapper: wrapper({ provider: 'gl' }),
      })

      const content = screen.getByText(
        /The bot posts the coverage report comment on merge request; since the bot is missing the report will not be visible./
      )

      expect(content).toBeInTheDocument()
    })
  })

  describe('when rendered with bb provider', () => {
    beforeEach(() => {
      setup()
    })

    it('renders heading of banner', () => {
      render(<BotErrorBanner {...defaultProps} />, {
        wrapper: wrapper({ provider: 'bb' }),
      })

      const title = screen.getByRole('link', { name: /Team bot/ })
      expect(title).toBeInTheDocument()

      expect(title).toHaveAttribute(
        'href',
        'https://docs.codecov.com/docs/team-bot'
      )
    })

    it('renders content', () => {
      render(<BotErrorBanner {...defaultProps} />, {
        wrapper: wrapper({ provider: 'bb' }),
      })

      const content = screen.getByText(
        /The bot posts the coverage report comment on pull requests; since the bot is missing the report will not be visible./
      )

      expect(content).toBeInTheDocument()
    })
  })

  describe('when rendered without errors', () => {
    beforeEach(() => {
      setup()
    })

    it('renders empty dom', () => {
      const { container } = render(<BotErrorBanner botErrorsCount={0} />, {
        wrapper: wrapper({ provider: 'gh' }),
      })

      expect(container).toBeEmptyDOMElement()
    })
  })
})
