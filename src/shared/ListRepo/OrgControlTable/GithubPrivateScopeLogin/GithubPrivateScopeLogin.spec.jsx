import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import GithubPrivateScopeLogin from './GithubPrivateScopeLogin'

const mockMeResponse = {
  user: { userName: 'codecov-user' },
  privateAccess: true,
}

const queryClient = new QueryClient()
const server = setupServer()

beforeAll(() => server.listen())
afterEach(() => {
  queryClient.clear()
  server.resetHandlers()
})
afterAll(() => server.close)

const wrapper =
  (initialEntries = ['/gh']) =>
  ({ children }) =>
    (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={initialEntries}>
          <Route path="/:provider">{children}</Route>
        </MemoryRouter>
      </QueryClientProvider>
    )

const mockEdges = [
  {
    node: {
      private: false,
      activated: true,
      author: {
        username: 'owner1',
      },
      name: 'Repo name 1',
      coverage: 43,
      active: true,
      lines: 99,
    },
  },
]

describe('GithubPrivateScopeLogin', () => {
  function setup(meResponse = mockMeResponse, edges = mockEdges) {
    server.use(
      graphql.query('CurrentUser', (req, res, ctx) => {
        return res(
          ctx.status(200),
          ctx.data({
            me: meResponse,
          })
        )
      }),
      graphql.query('ReposForOwner', (req, res, ctx) => {
        return res(
          ctx.status(200),
          ctx.data({
            owner: {
              repositories: {
                edges,
                pageInfo: {
                  hasNextPage: true,
                  endCursor: '2',
                },
              },
            },
          })
        )
      }),
      graphql.query('MyRepos', (req, res, ctx) => {
        const data = {
          me: {
            user: {
              username: 'codecov-user',
            },
            viewableRepositories: {
              edges: [
                {
                  name: 'python',
                },
              ],
            },
          },
        }
        return res(ctx.status(200), ctx.data(data))
      })
    )
  }

  describe('should not render', () => {
    beforeEach(() => {
      const meResponse = undefined
      setup(meResponse)
    })

    it('if no user exists', async () => {
      render(<GithubPrivateScopeLogin />, { wrapper: wrapper() })

      await waitFor(() => queryClient.isFetching)
      await waitFor(() => !queryClient.isFetching)

      expect(screen.queryByText('add private')).not.toBeInTheDocument()
    })

    it('if the user has a service other than github', () => {
      render(<GithubPrivateScopeLogin />, { wrapper: wrapper(['/bb']) })

      expect(screen.queryByText('add private')).not.toBeInTheDocument()
    })
  })

  describe('when user has private access', () => {
    beforeEach(() => {
      const meResponse = {
        user: { userName: 'codecov-user' },
        privateAccess: true,
      }
      setup(meResponse)
    })

    it('should not render the private button', () => {
      render(<GithubPrivateScopeLogin />, { wrapper: wrapper() })
      expect(screen.queryByText('add private')).not.toBeInTheDocument()
    })
  })

  describe('when there arent any repos', () => {
    beforeEach(() => {
      const meResponse = {
        user: { userName: 'codecov-user' },
        privateAccess: true,
      }
      const repoResponse = []
      setup(meResponse, repoResponse)
    })

    it('should not render the private button', () => {
      render(<GithubPrivateScopeLogin />, { wrapper: wrapper() })
      expect(screen.queryByText('add private')).not.toBeInTheDocument()
    })
  })

  describe('when there are repos and no private access', () => {
    beforeEach(() => {
      const meResponse = {
        user: { userName: 'codecov-user' },
        privateAccess: false,
      }
      const repoResponse = [
        {
          node: {
            private: false,
            activated: true,
            author: {
              username: 'owner1',
            },
            name: 'Repo name 1',
            coverage: 43,
            active: true,
            lines: 99,
          },
        },
      ]
      setup(meResponse, repoResponse)
    })

    it('should render the add private button', async () => {
      render(<GithubPrivateScopeLogin />, { wrapper: wrapper() })

      const addPrivate = await screen.findByText('add private')
      expect(addPrivate).toBeInTheDocument()
      expect(addPrivate).toHaveAttribute(
        'href',
        'https://stage-web.codecov.dev/login/gh?private=true'
      )
    })
  })
})
