import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import { TierNames } from 'services/tier'
import { ActiveContext } from 'shared/context'
import { useFlags } from 'shared/featureFlags'

import ListRepo from './ListRepo'

jest.mock('shared/featureFlags')

jest.mock('./OrgControlTable/RepoOrgNotFound', () => () => 'RepoOrgNotFound')
jest.mock('./ReposTable', () => () => 'ReposTable')
jest.mock('./ReposTableTeam', () => () => 'ReposTableTeam.tsx')

const server = setupServer()

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'warn' })
  console.error = () => {}
})
beforeEach(() => {
  queryClient.clear()
  server.resetHandlers()
})
afterAll(() => {
  server.close()
})

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
})

let testLocation

const wrapper =
  ({ url = '', path = '', repoDisplay = '' } = {}) =>
  ({ children }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[url]}>
        <ActiveContext.Provider value={repoDisplay}>
          {children}
          <Route
            path={path}
            render={({ location }) => {
              testLocation = location
              return null
            }}
          />
        </ActiveContext.Provider>
      </MemoryRouter>
    </QueryClientProvider>
  )

const mockUser = {
  owner: {
    defaultOrgUsername: 'codecov',
  },
  email: 'jane.doe@codecov.io',
  user: {
    username: 'janedoe',
  },
}

describe('ListRepo', () => {
  function setup(
    { tierValue = TierNames.PRO } = { tierValue: TierNames.PRO },
    me = mockUser
  ) {
    const user = userEvent.setup()

    useFlags.mockReturnValue({
      multipleTiers: true,
    })

    server.use(
      graphql.query('OwnerTier', (req, res, ctx) => {
        return res(
          ctx.status(200),
          ctx.data({ owner: { plan: { tierName: tierValue } } })
        )
      })
    )

    server.use(
      graphql.query('CurrentUser', (req, res, ctx) =>
        res(ctx.status(200), ctx.data(me))
      )
    )

    return { user, me }
  }

  describe('renders', () => {
    beforeEach(() => {
      setup()
    })

    it('renders the children', () => {
      render(<ListRepo canRefetch />, {
        wrapper: wrapper(),
      })

      expect(screen.getByText(/Not Configured/)).toBeInTheDocument()
    })

    it('renders the repo table', () => {
      render(<ListRepo canRefetch />, {
        wrapper: wrapper(),
      })

      expect(screen.getByText(/ReposTable/)).toBeInTheDocument()
    })
  })

  describe('reads URL parameters', () => {
    beforeEach(() => {
      setup()
    })

    it('reads search parameter from URL', () => {
      render(<ListRepo canRefetch />, {
        wrapper: wrapper({ url: '?search=thisisaquery' }),
      })

      const input = screen.getByTestId('org-control-search')
      expect(input).toHaveValue('thisisaquery')
    })
  })

  describe('switches Configured/Not Configured/All repos', () => {
    it('switches to active repos', async () => {
      const { user } = setup()
      render(<ListRepo canRefetch />, {
        wrapper: wrapper({ url: '/gh', path: '/:provider' }),
      })

      const button = screen.getByRole('button', {
        name: 'Configured',
        exact: true,
      })
      await user.click(button)
      expect(testLocation.state.repoDisplay).toEqual(
        expect.stringMatching('Configured')
      )
    })

    it('switches to Not Configured repos', async () => {
      const { user } = setup()
      render(<ListRepo canRefetch />, {
        wrapper: wrapper({ url: '/gh', path: '/:provider' }),
      })

      const button = screen.getByRole('button', {
        name: /Not Configured/,
      })
      await user.click(button)
      expect(testLocation.state.repoDisplay).toEqual(
        expect.stringContaining('Not Configured')
      )
    })

    it('switches to Configured repos owner page', async () => {
      const { user } = setup()
      render(<ListRepo canRefetch />, {
        wrapper: wrapper({
          url: '/gh/hola',
          path: '/:provider/:owner',
        }),
      })
      const button = screen.getByRole('button', {
        name: 'Configured',
        exact: true,
      })
      await user.click(button)
      expect(testLocation.state.repoDisplay).toEqual(
        expect.stringMatching('Configured')
      )
    })

    it('switches to all repos owner page', async () => {
      const { user } = setup()
      render(<ListRepo canRefetch />, {
        wrapper: wrapper({
          url: '/gh/hola',
          path: '/:provider/:owner',
        }),
      })

      const button = screen.getByRole('button', {
        name: /All/,
      })
      await user.click(button)
      expect(testLocation.state.repoDisplay).toEqual(
        expect.stringContaining('All')
      )
    })
  })

  describe('update params after typing', () => {
    it('calls setSearchValue', async () => {
      const { user } = setup()
      render(<ListRepo canRefetch />, {
        wrapper: wrapper(),
      })

      const searchInput = screen.getByRole('textbox', {
        name: /Search/,
      })
      await user.type(searchInput, 'some random repo')

      await waitFor(() => {
        expect(testLocation.state.search).toBe('some random repo')
      })
    })
  })

  describe('when rendered for team tier', () => {
    beforeEach(() => {
      setup({ tierValue: TierNames.TEAM })
    })

    it('renders the team table', async () => {
      render(<ListRepo canRefetch />, {
        wrapper: wrapper(),
      })
      const table = await screen.findByText(/ReposTableTeam/)
      expect(table).toBeInTheDocument()
    })
  })

  describe('welcome demo alert banner', () => {
    it('shows alert banner if it is my owner page and I came from onboarding', async () => {
      const { me } = setup()
      render(<ListRepo canRefetch />, {
        wrapper: wrapper({
          url: '/gh/janedoe?source=onboarding',
          path: '/:provider/:owner',
        }),
      })
      expect(me.user.username).toEqual('janedoe')
      const alert = screen.queryByRole('alert')
      expect(alert).toBeInTheDocument()
    })

    it('does not show alert banner if it is not my owner page', async () => {
      const { me } = setup()
      render(<ListRepo canRefetch />, {
        wrapper: wrapper({
          url: '/gh/notjane?source=onboarding',
          path: '/:provider/:owner',
        }),
      })
      expect(me.user.username).toEqual('janedoe')
      const alert = screen.queryByRole('alert')
      expect(alert).not.toBeInTheDocument()
    })

    it('does not show alert banner if I did not come from onboarding', async () => {
      const { me } = setup()
      render(<ListRepo canRefetch />, {
        wrapper: wrapper({
          url: '/gh/janedoe',
          path: '/:provider/:owner',
        }),
      })
      expect(me.user.username).toEqual('janedoe')
      const alert = screen.queryByRole('alert')
      expect(alert).not.toBeInTheDocument()
    })
  })
})
