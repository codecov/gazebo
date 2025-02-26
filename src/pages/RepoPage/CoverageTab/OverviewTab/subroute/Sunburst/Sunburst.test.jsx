import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  QueryClientProvider as QueryClientProviderV5,
  QueryClient as QueryClientV5,
} from '@tanstack/react-queryV5'
import { render, screen } from '@testing-library/react'
import { graphql, http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import Sunburst, { getPathsToDisplay } from './Sunburst'

vi.mock('ui/SunburstChart', () => ({ default: () => 'Chart Mocked' }))

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})
const queryClientV5 = new QueryClientV5({
  defaultOptions: { queries: { retry: false } },
})

const wrapper = ({ children }) => (
  <QueryClientProviderV5 client={queryClientV5}>
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/gh/codecov/cool-repo/tree/main']}>
        <Route path="/:provider/:owner/:repo/tree/:branch">{children}</Route>
      </MemoryRouter>
    </QueryClientProvider>
  </QueryClientProviderV5>
)

const server = setupServer()
beforeAll(() => {
  server.listen({ onUnhandledRequest: 'warn' })
})

afterEach(() => {
  queryClient.clear()
  queryClientV5.clear()
  server.resetHandlers()
})

afterAll(() => {
  server.close()
})

const treeMock = [
  {
    name: 'repoName',
    fullPath: 'repoName',
    coverage: 100,
    lines: 100,
    hits: 100,
    partials: 0,
    misses: 0,
    children: [],
  },
]

const mockNullTree = null

const overviewMock = {
  owner: {
    isCurrentUserActivated: true,
    repository: {
      __typename: 'Repository',
      private: false,
      defaultBranch: 'main',
      oldestCommitAt: '2022-10-10T11:59:59',
      coverageEnabled: true,
      bundleAnalysisEnabled: true,
      languages: [],
      testAnalyticsEnabled: false,
    },
  },
}

const repoConfigMock = {
  owner: {
    repository: {
      __typename: 'Repository',
      repositoryConfig: { indicationRange: { upperRange: 80, lowerRange: 60 } },
    },
  },
}

describe('Sunburst', () => {
  function setup({ coverageTreeStatus = 200, coverageTreeData = treeMock }) {
    server.use(
      graphql.query('GetRepoOverview', () => {
        return HttpResponse.json({ data: overviewMock })
      }),
      graphql.query('RepoConfig', () => {
        return HttpResponse.json({ data: repoConfigMock })
      }),
      http.get('/internal/:provider/:owner/:repo/coverage/tree', () => {
        return HttpResponse.json(coverageTreeData, {
          status: coverageTreeStatus,
        })
      })
    )
  }

  describe('successful call', () => {
    describe('with valid tree data', () => {
      it('renders something', async () => {
        setup({ coverageTreeStatus: 200 })
        render(<Sunburst />, { wrapper })

        const chart = await screen.findByText('Chart Mocked')

        expect(chart).toBeInTheDocument()
      })
    })

    describe('with invalid tree data', () => {
      it('renders something', async () => {
        setup({ coverageTreeStatus: 200, coverageTreeData: mockNullTree })
        render(<Sunburst />, { wrapper })

        const chart = await screen.findByText(
          'The sunburst chart failed to load.'
        )
        expect(chart).toBeInTheDocument()
      })
    })
  })

  describe('tree 500', () => {
    beforeEach(() => {
      // disable intentional error in vi log
      vi.spyOn(console, 'error').mockImplementation(() => {})
    })

    it('renders something', async () => {
      setup({ repoOverviewData: overviewMock, coverageTreeStatus: 500 })
      render(<Sunburst />, { wrapper })

      const chart = await screen.findByText(
        'The sunburst chart failed to load.'
      )

      expect(chart).toBeInTheDocument()
    })
  })

  describe('getPathsToDisplay', () => {
    it('handles one segment', () => {
      const breadcrumbPaths = [{ text: 'root' }]

      const pathsToDisplay = getPathsToDisplay(breadcrumbPaths)
      expect(pathsToDisplay).toEqual([{ text: 'root' }])
    })
    it('handles multiple segments', () => {
      const breadcrumbPaths = [
        { text: 'file' },
        { text: 'folder' },
        { text: 'root' },
      ]

      const pathsToDisplay = getPathsToDisplay(breadcrumbPaths)
      expect(pathsToDisplay).toEqual([{ text: 'file' }, { text: '...' }])
    })
  })
})
