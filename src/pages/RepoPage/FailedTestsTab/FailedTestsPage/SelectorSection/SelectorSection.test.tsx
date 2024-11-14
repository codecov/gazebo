import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { PropsWithChildren, Suspense } from 'react'
import { MemoryRouter, Route, useLocation } from 'react-router-dom'

import SelectorSection from './SelectorSection'

const mockRepoOverview = {
  owner: {
    isCurrentUserActivated: true,
    repository: {
      __typename: 'Repository',
      private: false,
      defaultBranch: 'main',
      oldestCommitAt: '2022-10-10T11:59:59',
      coverageEnabled: false,
      bundleAnalysisEnabled: false,
      languages: ['javascript'],
      testAnalyticsEnabled: true,
    },
  },
}

const mockFlags = {
  __typename: 'Repository',
  testAnalytics: {
    flags: ['alpha', 'beta', 'charlie', 'delta'],
  },
}

const mockTestSuites = {
  __typename: 'Repository',
  testAnalytics: {
    testSuites: ['java', 'script', 'ok', 'blahbloo'],
  },
}

const mockBranch = {
  branch: {
    name: 'main',
    head: {
      commitid: '321fdsa',
    },
  },
}

const mockBranches = {
  __typename: 'Repository',
  branches: {
    edges: [
      {
        node: {
          name: 'branch-1',
          head: { commitid: 'asdf123' },
        },
      },
      {
        node: {
          name: 'main',
          head: { commitid: '321fdsa' },
        },
      },
    ],
    pageInfo: {
      hasNextPage: false,
      endCursor: 'end-cursor',
    },
  },
}

const queryClient = new QueryClient({
  defaultOptions: { queries: { suspense: true, retry: false } },
})
const server = setupServer()

let testLocation: ReturnType<typeof useLocation>
const wrapper: (initialEntries?: string) => React.FC<PropsWithChildren> =
  (initialEntries = '/gh/codecov/cool-repo/tests') =>
  ({ children }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialEntries]}>
        <Route
          path={[
            '/:provider/:owner/:repo/tests',
            '/:provider/:owner/:repo/tests/:branch',
          ]}
          exact
        >
          <Suspense fallback={null}>{children}</Suspense>
        </Route>
        <Route
          path="*"
          render={({ location }) => {
            testLocation = location
            return null
          }}
        />
      </MemoryRouter>
    </QueryClientProvider>
  )

beforeAll(() => {
  server.listen()
})

afterEach(() => {
  queryClient.clear()
  server.restoreHandlers()
})

afterAll(() => {
  server.close()
})

describe('SelectorSection', () => {
  function setup() {
    const user = userEvent.setup()

    server.use(
      graphql.query('GetRepoOverview', (info) => {
        return HttpResponse.json({ data: mockRepoOverview })
      }),
      graphql.query('GetBranch', (info) => {
        return HttpResponse.json({
          data: {
            owner: { repository: { __typename: 'Repository', ...mockBranch } },
          },
        })
      }),
      graphql.query('GetBranches', (info) => {
        return HttpResponse.json({
          data: { owner: { repository: mockBranches } },
        })
      }),
      graphql.query('GetTestResultsFlags', (info) => {
        return HttpResponse.json({
          data: { owner: { repository: mockFlags } },
        })
      }),
      graphql.query('GetTestResultsTestSuites', (info) => {
        return HttpResponse.json({
          data: { owner: { repository: mockTestSuites } },
        })
      })
    )

    return { user }
  }

  describe('when not on default branch', () => {
    it('does not have the three filter selectors', async () => {
      setup()
      render(<SelectorSection />, {
        wrapper: wrapper('/gh/owner/repo/tests/lol'),
      })

      const branchSelector = await screen.findByText('Branch Context')
      const historicalTrend = screen.queryByText('Historical trend')
      const testSuites = screen.queryByText('Test suites')
      const flags = screen.queryByText('Flags')
      expect(branchSelector).toBeInTheDocument()
      expect(historicalTrend).not.toBeInTheDocument()
      expect(testSuites).not.toBeInTheDocument()
      expect(flags).not.toBeInTheDocument()
    })
  })

  describe('when on default branch', () => {
    it('has all four selectors', async () => {
      setup()
      render(<SelectorSection />, {
        wrapper: wrapper('/gh/owner/repo/tests/main'),
      })

      const branchSelector = await screen.findByText('Branch Context')
      const historicalTrend = await screen.findByText('Historical trend')
      const testSuites = await screen.findByText('Test suites')
      const flags = await screen.findByText('Flags')
      expect(branchSelector).toBeInTheDocument()
      expect(historicalTrend).toBeInTheDocument()
      expect(testSuites).toBeInTheDocument()
      expect(flags).toBeInTheDocument()
    })

    it('has 60 day retention link', async () => {
      setup()
      render(<SelectorSection />, {
        wrapper: wrapper('/gh/owner/repo/tests/main'),
      })

      const link = await screen.findByRole('link')
      expect(link).toBeInTheDocument()

      expect(link).toHaveAttribute(
        'href',
        'https://docs.codecov.com/docs/test-analytics#data-retention'
      )
    })
  })

  describe('when selecting a flag from flag selector', () => {
    it('updates the location params', async () => {
      const { user } = setup()

      render(<SelectorSection />, {
        wrapper: wrapper('/gh/owner/repo/tests/main'),
      })
      const select = await screen.findByText('All flags')
      expect(select).toBeInTheDocument()
      await user.click(select)

      const flag1 = await screen.findByText('alpha')
      expect(flag1).toBeInTheDocument()
      await user.click(flag1)

      expect(testLocation?.state).toStrictEqual({
        flags: ['alpha'],
        historicalTrend: '',
        testSuites: [],
        parameter: '',
        term: '',
      })
    })
  })

  describe('when selecting a suite from test suite selector', () => {
    it('updates the location params', async () => {
      const { user } = setup()

      render(<SelectorSection />, {
        wrapper: wrapper('/gh/owner/repo/tests/main'),
      })
      const select = await screen.findByText('All test suites')
      expect(select).toBeInTheDocument()
      await user.click(select)

      const jsSuite = await screen.findByText('java')
      expect(jsSuite).toBeInTheDocument()
      await user.click(jsSuite)

      expect(testLocation?.state).toStrictEqual({
        flags: [],
        historicalTrend: '',
        testSuites: ['java'],
        parameter: '',
        term: '',
      })
    })
  })

  describe('when selecting a suite from historical trend selector', () => {
    it('updates the location params', async () => {
      const { user } = setup()

      render(<SelectorSection />, {
        wrapper: wrapper('/gh/owner/repo/tests/main'),
      })
      const select = await screen.findByText('Last 30 days')
      expect(select).toBeInTheDocument()
      await user.click(select)

      const jsSuite = await screen.findByText('Last 7 days')
      expect(jsSuite).toBeInTheDocument()
      await user.click(jsSuite)

      expect(testLocation?.state).toStrictEqual({
        flags: [],
        historicalTrend: 'INTERVAL_7_DAY',
        testSuites: [],
        parameter: '',
        term: '',
      })
    })
  })
})
