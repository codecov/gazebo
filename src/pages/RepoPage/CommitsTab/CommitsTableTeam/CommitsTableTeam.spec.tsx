import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  render,
  screen,
  waitForElementToBeRemoved,
} from '@testing-library/react'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { mockIsIntersecting } from 'react-intersection-observer/test-utils'
import { MemoryRouter, Route } from 'react-router-dom'

import CommitsTableTeam from './CommitsTableTeam'

const node1 = {
  ciPassed: true,
  message: 'commit message 1',
  commitid: 'fdb5b182241cfdc8d8a8dd1c6f98d1259f522b9c',
  createdAt: '2023-10-11T00:00.000000',
  author: {
    username: 'codecov-user',
    avatarUrl: 'cool-avatar-url',
  },
  compareWithParent: {
    __typename: 'Comparison',
    patchTotals: {
      percentCovered: 80,
    },
  },
}

const node2 = {
  ciPassed: false,
  message: 'commit message 2 ',
  commitid: 'c8e17f4e29983bdb5027de77d6ef150cd911f2b9',
  createdAt: '2023-10-12T00:00.000000',
  author: {
    username: 'codecov-user',
    avatarUrl: 'cool-avatar-url',
  },
  compareWithParent: {
    __typename: 'Comparison',
    patchTotals: {
      percentCovered: 90,
    },
  },
}

const node3 = {
  ciPassed: false,
  message: 'commit message 3',
  commitid: '7822fd88f36efcd9af276792813a83da17bd3c67',
  createdAt: '2023-10-13T00:00.000000',
  author: {
    username: 'codecov-user',
    avatarUrl: 'cool-avatar-url',
  },
  compareWithParent: {
    __typename: 'Comparison',
    patchTotals: {
      percentCovered: 100,
    },
  },
}

const server = setupServer()
const wrapper =
  (queryClient: QueryClient): React.FC<React.PropsWithChildren> =>
  ({ children }) =>
    (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/gh/codecov/cool-repo/commits']}>
          <Route path="/:provider/:owner/:repo/commits">{children}</Route>
        </MemoryRouter>
      </QueryClientProvider>
    )

beforeAll(() => {
  server.listen()
})

afterEach(() => {
  server.resetHandlers()
})

afterAll(() => {
  server.close()
})

interface SetupArgs {
  noEntries?: boolean
}

describe('CommitsTableTeam', () => {
  function setup({ noEntries = false }: SetupArgs) {
    const queryClient = new QueryClient()

    server.use(
      graphql.query('GetCommitsTeam', (req, res, ctx) => {
        if (noEntries) {
          return res(
            ctx.status(200),
            ctx.data({
              owner: {
                repository: {
                  __typename: 'Repository',
                  commits: {
                    edges: [],
                    pageInfo: {
                      hasNextPage: false,
                      endCursor: null,
                    },
                  },
                },
              },
            })
          )
        }

        const dataReturned = {
          owner: {
            repository: {
              __typename: 'Repository',
              commits: {
                edges: req.variables.after
                  ? [
                      {
                        node: node3,
                      },
                    ]
                  : [
                      {
                        node: node1,
                      },
                      {
                        node: node2,
                      },
                    ],
                pageInfo: {
                  hasNextPage: req.variables.after ? false : true,
                  endCursor: req.variables.after
                    ? 'aa'
                    : 'MjAyMC0wOC0xMSAxNzozMDowMiswMDowMHwxMDA=',
                },
              },
            },
          },
        }
        return res(ctx.status(200), ctx.data(dataReturned))
      })
    )

    return { queryClient }
  }

  describe('renders table headers', () => {
    it('renders name column', async () => {
      const { queryClient } = setup({})
      render(<CommitsTableTeam branch="main" states={[]} search="" />, {
        wrapper: wrapper(queryClient),
      })

      const nameColumn = await screen.findByText('Name')
      expect(nameColumn).toBeInTheDocument()
    })

    it('renders ci status column', async () => {
      const { queryClient } = setup({})
      render(<CommitsTableTeam branch="main" states={[]} search="" />, {
        wrapper: wrapper(queryClient),
      })

      const ciStatusColumn = await screen.findByText('CI Status')
      expect(ciStatusColumn).toBeInTheDocument()
    })

    it('renders patch column', async () => {
      const { queryClient } = setup({})
      render(<CommitsTableTeam branch="main" states={[]} search="" />, {
        wrapper: wrapper(queryClient),
      })

      const patchColumn = await screen.findByText('Patch')
      expect(patchColumn).toBeInTheDocument()
    })
  })

  describe('renders table body', () => {
    it('renders name column', async () => {
      const { queryClient } = setup({})
      render(<CommitsTableTeam branch="main" states={[]} search="" />, {
        wrapper: wrapper(queryClient),
      })

      const loading = await screen.findByText('Loading')
      mockIsIntersecting(loading, false)

      const nameColumn = await screen.findByText('commit message 1')
      expect(nameColumn).toBeInTheDocument()
    })

    it('renders ci status column', async () => {
      const { queryClient } = setup({})
      render(<CommitsTableTeam branch="main" states={[]} search="" />, {
        wrapper: wrapper(queryClient),
      })

      const loading = await screen.findByText('Loading')
      mockIsIntersecting(loading, false)

      const ciStatusColumn = await screen.findByText('fdb5b182')
      expect(ciStatusColumn).toBeInTheDocument()
    })

    it('renders patch column', async () => {
      const { queryClient } = setup({})
      render(<CommitsTableTeam branch="main" states={[]} search="" />, {
        wrapper: wrapper(queryClient),
      })

      const loading = await screen.findByText('Loading')
      mockIsIntersecting(loading, false)

      const patchColumn = await screen.findByText('80.00%')
      expect(patchColumn).toBeInTheDocument()
    })
  })

  describe('no data is returned', () => {
    it('renders error message', async () => {
      const { queryClient } = setup({ noEntries: true })
      render(<CommitsTableTeam branch="main" states={[]} search="" />, {
        wrapper: wrapper(queryClient),
      })

      const errorMessage = await screen.findByText('No commits found')
      expect(errorMessage).toBeInTheDocument()
    })
  })

  describe('infinite scrolling', () => {
    it('loads next page', async () => {
      const { queryClient } = setup({})
      render(<CommitsTableTeam branch="main" states={[]} search="" />, {
        wrapper: wrapper(queryClient),
      })

      const loading = await screen.findByText('Loading')
      mockIsIntersecting(loading, true)
      await waitForElementToBeRemoved(loading)

      const thirdCommit = await screen.findByText('commit message 3')
      expect(thirdCommit).toBeInTheDocument()
    })
  })
})
