import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { graphql, rest } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import { useFlags } from 'shared/featureFlags'

import CoverageTab from './CoverageTab'

jest.mock('shared/featureFlags')

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
})
const server = setupServer()

const wrapper =
  (initialEntries = ['/gh/codecov/cool-repo/tree/main']) =>
  ({ children }) =>
    (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>
      </QueryClientProvider>
    )

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
    username: 'Rabee-AbuBaker',
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
      graphql.query('GetRepoOverview', (req, res, ctx) => {
        return res(ctx.status(200), ctx.data(overviewMock))
      }),
      rest.get(
        '/internal/:provider/:owner/:repo/coverage/tree',
        (req, res, ctx) => {
          return res(ctx.status(200), ctx.json({ data: treeMock }))
        }
      )
    )
  }

  describe('sunburst flag enabled', () => {
    beforeEach(() => {
      useFlags.mockReturnValue({ coverageSunburstChart: true })

      setup()
    })
    afterEach(() => jest.resetAllMocks)

    it('renders the sunburst chart', async () => {
      render(
        <Route path="/:provider/:owner/:repo" exact={true}>
          <CoverageTab />
        </Route>,
        { wrapper: wrapper(['/gh/test-org/test-repo']) }
      )

      const hideChart = await screen.findByText(/Hide Chart/)

      expect(hideChart).toBeInTheDocument()

      const toggleContents = screen.getByTestId('toggle-element-contents')

      expect(toggleContents.childElementCount).toBe(2)
    })
  })

  describe('sunburst flag disabled', () => {
    beforeEach(() => {
      useFlags.mockReturnValue({ coverageSunburstChart: false })

      setup()
    })
    afterEach(() => jest.resetAllMocks)

    it('renders the sunburst chart', async () => {
      render(
        <Route path="/:provider/:owner/:repo" exact={true}>
          <CoverageTab />
        </Route>,
        { wrapper: wrapper(['/gh/test-org/test-repo']) }
      )

      const hideChart = await screen.findByText(/Hide Chart/)

      expect(hideChart).toBeInTheDocument()

      const toggleContents = screen.getByTestId('toggle-element-contents')

      expect(toggleContents.childElementCount).toBe(1)
    })
  })
})
