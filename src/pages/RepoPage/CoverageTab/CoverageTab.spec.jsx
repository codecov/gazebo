import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import { graphql, rest } from 'msw'
import { setupServer } from 'msw/node'
import { Suspense } from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

import CoverageTab from './CoverageTab'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      suspense: true,
    },
  },
})

const server = setupServer()

const wrapper =
  (initialEntries = ['/gh/codecov/cool-repo/tree/main']) =>
  ({ children }) =>
    (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={initialEntries}>
          <Route path="/:provider/:owner/:repo" exact={true}>
            <Suspense fallback={null}>{children}</Suspense>
          </Route>
        </MemoryRouter>
      </QueryClientProvider>
    )

const mockRepo = {
  owner: {
    repository: {
      defaultBranch: 'main',
    },
  },
}

const repoConfigMock = {
  owner: {
    repository: {
      repositoryConfig: {
        indicationRange: { upperRange: 80, lowerRange: 60 },
      },
    },
  },
}

const treeMock = { name: 'repoName', children: [] }

const overviewMock = {
  owner: { repository: { private: false, defaultBranch: 'main' } },
}

const branchesMock = {
  owner: {
    repository: {
      branches: {
        edges: [
          {
            node: {
              name: 'main',
              head: {
                commitid: '1',
              },
            },
          },
          {
            node: {
              name: 'dummy',
              head: {
                commitid: '2',
              },
            },
          },
          {
            node: {
              name: 'dummy2',
              head: {
                commitid: '3',
              },
            },
          },
        ],
        pageInfo: {
          hasNextPage: false,
          endCursor: 'someEndCursor',
        },
      },
    },
  },
}

const branchMock = {
  branch: {
    name: 'main',
    head: {
      commitid: '321fdsa',
    },
  },
}

const branchesContentsMock = {
  owner: {
    username: 'critical-role',
    repository: {
      repositoryConfig: {
        indicationRange: {
          upperRange: 80,
          lowerRange: 60,
        },
      },
      branch: {
        head: {
          pathContents: {
            results: [
              {
                name: 'flag1',
                filePath: null,
                percentCovered: 100.0,
                type: 'dir',
              },
            ],
          },
        },
      },
    },
  },
}

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'warn' })
})
afterEach(() => {
  queryClient.clear()
  server.resetHandlers()
})
afterAll(() => {
  server.close()
})

describe('Coverage Tab', () => {
  function setup({ repoData = mockRepo } = { repoData: mockRepo }) {
    server.use(
      graphql.query('GetRepo', (req, res, ctx) =>
        res(ctx.status(200), ctx.data(repoData))
      ),
      graphql.query('GetBranches', (req, res, ctx) =>
        res(ctx.status(200), ctx.data(branchesMock))
      ),
      graphql.query('GetBranch', (req, res, ctx) =>
        res(ctx.status(200), ctx.data({ owner: { repository: branchMock } }))
      ),
      graphql.query('BranchContents', (req, res, ctx) =>
        res(ctx.status(200), ctx.data(branchesContentsMock))
      ),
      graphql.query('RepoConfig', (req, res, ctx) =>
        res(ctx.status(200), ctx.data(repoConfigMock))
      ),
      graphql.query('GetRepoOverview', (req, res, ctx) =>
        res(ctx.status(200), ctx.data(overviewMock))
      ),
      graphql.query('GetRepoCoverage', (req, res, ctx) =>
        res(ctx.status(200), ctx.data({}))
      ),
      graphql.query('GetBranchCoverageMeasurements', (req, res, ctx) =>
        res(ctx.status(200), ctx.data({}))
      ),
      rest.get(
        '/internal/:provider/:owner/:repo/coverage/tree',
        (req, res, ctx) => {
          return res(ctx.status(200), ctx.json({ data: treeMock }))
        }
      ),
      rest.post(
        '/internal/charts/:provider/:owner/coverage/:repo',
        (req, res, ctx) => {
          return res(ctx.status(200), ctx.json({ data: {} }))
        }
      )
    )
  }

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('renders the sunburst chart', async () => {
    setup()

    render(<CoverageTab />, { wrapper: wrapper(['/gh/test-org/test-repo']) })

    await waitFor(() => expect(queryClient.isFetching()).toBeGreaterThan(0))
    await waitFor(() => expect(queryClient.isFetching()).toBe(0))

    expect(await screen.findByText(/Hide Chart/)).toBeTruthy()
    const hideChart = screen.getByText(/Hide Chart/)
    expect(hideChart).toBeInTheDocument()

    expect(await screen.findByTestId('toggle-element-contents')).toBeTruthy()
    const toggleContents = screen.getByTestId('toggle-element-contents')

    // eslint-disable-next-line testing-library/no-node-access
    expect(toggleContents.childElementCount).toBe(2)
  }, 10000)
})
