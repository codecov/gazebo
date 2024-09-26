import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, renderHook, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { graphql, HttpResponse } from 'msw2'
import { setupServer } from 'msw2/node'
import { Suspense } from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

import CommitBundleAnalysisTable, {
  useTableData,
} from './CommitBundleAnalysisTable'

const mockCommitBundleListData = {
  owner: {
    repository: {
      __typename: 'Repository',
      commit: {
        bundleAnalysisCompareWithParent: {
          __typename: 'BundleAnalysisComparison',
          bundles: [
            {
              name: 'bundle.js',
              changeType: 'added',
              bundleChange: {
                loadTime: { threeG: 3 },
                size: { uncompress: 1 },
              },
              bundleData: {
                loadTime: { threeG: 4 },
                size: { uncompress: 3 },
              },
            },
            {
              name: 'bundle.css',
              changeType: 'added',
              bundleChange: {
                loadTime: { threeG: 33 },
                size: { uncompress: -1000 },
              },
              bundleData: {
                loadTime: { threeG: 45 },
                size: { uncompress: 3000 },
              },
            },
          ],
        },
      },
    },
  },
}

const mockEmptyCommitBundleListData = {
  owner: {
    repository: {
      __typename: 'Repository',
      commit: {
        bundleAnalysisCompareWithParent: {
          __typename: 'BundleAnalysisComparison',
          bundles: [],
        },
      },
    },
  },
}

const mockNonComparisonTypeData = {
  owner: {
    repository: {
      __typename: 'Repository',
      commit: {
        bundleAnalysisCompareWithParent: {
          __typename: 'FirstPullRequest',
          message: 'First pull request',
        },
      },
    },
  },
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      suspense: true,
    },
  },
})

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <MemoryRouter
    initialEntries={[
      '/gh/test-org/test-repo/commit/e28923f6ed227d37d30c304ecc1cf72c564c75dd',
    ]}
  >
    <Route path="/:provider/:owner/:repo/:commit">
      <QueryClientProvider client={queryClient}>
        <Suspense fallback={<p>Loading...</p>}>{children}</Suspense>
      </QueryClientProvider>
    </Route>
  </MemoryRouter>
)

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

interface SetupArgs {
  isEmptyList?: boolean
  nonComparisonType?: boolean
}

describe('CommitBundleAnalysisTable', () => {
  function setup(
    { isEmptyList = false, nonComparisonType = false }: SetupArgs = {
      isEmptyList: false,
      nonComparisonType: false,
    }
  ) {
    const user = userEvent.setup()
    server.use(
      graphql.query('CommitBundleList', (info) => {
        if (isEmptyList) {
          return HttpResponse.json({ data: mockEmptyCommitBundleListData })
        } else if (nonComparisonType) {
          return HttpResponse.json({ data: mockNonComparisonTypeData })
        } else {
          return HttpResponse.json({ data: mockCommitBundleListData })
        }
      })
    )

    return { user }
  }

  describe('there are bundles present', () => {
    describe('renders header', () => {
      it('renders name column', async () => {
        setup()
        render(<CommitBundleAnalysisTable />, { wrapper })

        const nameColumn = await screen.findByText('Bundle name')
        expect(nameColumn).toBeInTheDocument()
      })

      it('renders previous size column', async () => {
        setup()
        render(<CommitBundleAnalysisTable />, { wrapper })

        const prevSizeColumn = await screen.findByText('Previous size')
        expect(prevSizeColumn).toBeInTheDocument()
      })

      it('renders new size column', async () => {
        setup()
        render(<CommitBundleAnalysisTable />, { wrapper })

        const newSizeColumn = await screen.findByText('New size')
        expect(newSizeColumn).toBeInTheDocument()
      })

      it('renders change column', async () => {
        setup()
        render(<CommitBundleAnalysisTable />, { wrapper })

        const changeColumn = await screen.findByText('Change')
        expect(changeColumn).toBeInTheDocument()
      })
    })

    describe('renders rows', () => {
      it('renders bundle name', async () => {
        setup()
        render(<CommitBundleAnalysisTable />, { wrapper })

        const bundleName = await screen.findByText('bundle.js')
        expect(bundleName).toBeInTheDocument()
      })

      it('renders previous size', async () => {
        setup()
        render(<CommitBundleAnalysisTable />, { wrapper })

        const prevSize = await screen.findByText('3B')
        expect(prevSize).toBeInTheDocument()
      })

      it('renders new size', async () => {
        setup()
        render(<CommitBundleAnalysisTable />, { wrapper })

        const newSize = await screen.findByText('2B')
        expect(newSize).toBeInTheDocument()
      })

      it('renders change', async () => {
        setup()
        render(<CommitBundleAnalysisTable />, { wrapper })

        const change = await screen.findByText('+1B')
        expect(change).toBeInTheDocument()
      })
    })
  })

  describe('there are no bundles present', () => {
    it('renders no bundles message', async () => {
      setup({ isEmptyList: true })
      render(<CommitBundleAnalysisTable />, { wrapper })

      const noBundlesMessage = await screen.findByText(
        'No bundles were found in this commit'
      )
      expect(noBundlesMessage).toBeInTheDocument()
    })
  })

  describe('non-comparison type is returned', () => {
    it('renders an empty document', async () => {
      setup({ nonComparisonType: true })

      const { container } = render(<CommitBundleAnalysisTable />, { wrapper })

      await waitFor(() => expect(container).toBeEmptyDOMElement())
    })
  })
})

describe('useTableData', () => {
  function setup(
    { isEmptyList = false, nonComparisonType = false }: SetupArgs = {
      isEmptyList: false,
      nonComparisonType: false,
    }
  ) {
    server.use(
      graphql.query('CommitBundleList', (info) => {
        if (nonComparisonType) {
          return HttpResponse.json({ data: mockNonComparisonTypeData })
        } else {
          return HttpResponse.json({ data: mockCommitBundleListData })
        }
      })
    )
  }

  describe('valid bundle data is returned', () => {
    it('creates a table data object', async () => {
      setup()
      const { result } = renderHook(() => useTableData(), { wrapper })

      await waitFor(() =>
        expect(result.current).toStrictEqual([
          {
            name: 'bundle.js',
            prevSize: 2,
            newSize: 3,
            change: 1,
          },
          {
            name: 'bundle.css',
            prevSize: 4000,
            newSize: 3000,
            change: -1000,
          },
        ])
      )
    })
  })

  describe('invalid bundle data is returned', () => {
    it('returns an empty list', async () => {
      setup({ nonComparisonType: true })
      const { result } = renderHook(() => useTableData(), { wrapper })

      await waitFor(() => expect(result.current).toStrictEqual([]))
    })
  })
})
