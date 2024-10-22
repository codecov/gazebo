import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { graphql, http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import Sunburst, { getPathsToDisplay } from './Sunburst'

vi.mock('ui/SunburstChart', () => ({ default: () => 'Chart Mocked' }))

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
})
const server = setupServer()

const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter initialEntries={['/gh/codecov/cool-repo/tree/main']}>
      <Route path="/:provider/:owner/:repo/tree/:branch">{children}</Route>
    </MemoryRouter>
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

const treeMock = { name: 'repoName', children: [] }
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
      repositoryConfig: {
        indicationRange: { upperRange: 80, lowerRange: 60 },
      },
    },
  },
}

describe('Sunburst', () => {
  function setup({
    repoOverviewData,
    coverageTreeRes,
    coverageTreeStatus = 200,
  }) {
    server.use(
      graphql.query('GetRepoOverview', (info) => {
        return HttpResponse.json({ data: repoOverviewData })
      }),
      graphql.query('RepoConfig', (info) => {
        return HttpResponse.json({ data: repoConfigMock })
      }),
      http.get('/internal/:provider/:owner/:repo/coverage/tree', (info) => {
        return HttpResponse.json(
          { data: coverageTreeRes },
          { status: coverageTreeStatus }
        )
      })
    )
  }

  describe('successful call', () => {
    beforeEach(() => {
      setup({
        repoOverviewData: overviewMock,
        coverageTreeRes: treeMock,
        coverageTreeStatus: 200,
      })
    })

    it('renders something', async () => {
      render(<Sunburst />, { wrapper })

      const chart = await screen.findByText('Chart Mocked')

      expect(chart).toBeInTheDocument()
    })
  })

  describe('tree 500', () => {
    beforeEach(() => {
      // disable intentional error in vi log
      vi.spyOn(console, 'error').mockImplementation(() => {})

      setup({
        repoOverviewData: overviewMock,
        coverageTreeStatus: 500,
      })
    })

    it('renders something', async () => {
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
