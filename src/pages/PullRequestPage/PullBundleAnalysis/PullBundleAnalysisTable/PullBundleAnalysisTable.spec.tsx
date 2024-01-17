import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, renderHook, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { Suspense } from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

import PullBundleAnalysisTable, {
  useTableData,
} from './PullBundleAnalysisTable'

const mockPullBundleListData = {
  owner: {
    repository: {
      __typename: 'Repository',
      pull: {
        bundleAnalysisCompareWithBase: {
          __typename: 'BundleAnalysisComparison',
          bundles: [
            {
              name: 'bundle.js',
              changeType: 'added',
              sizeDelta: 1,
              sizeTotal: 3,
              loadTimeDelta: 3,
              loadTimeTotal: 4,
            },
            {
              name: 'bundle.css',
              changeType: 'added',
              sizeDelta: -1000,
              sizeTotal: 3000,
              loadTimeDelta: 33,
              loadTimeTotal: 45,
            },
          ],
        },
      },
    },
  },
}

const mockEmptyPullBundleListData = {
  owner: {
    repository: {
      __typename: 'Repository',
      pull: {
        bundleAnalysisCompareWithBase: {
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
      pull: {
        bundleAnalysisCompareWithBase: {
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
const server = setupServer()

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <MemoryRouter initialEntries={['/gh/test-org/test-repo/pull/123']}>
    <Route path="/:provider/:owner/:repo/:pullId">
      <QueryClientProvider client={queryClient}>
        <Suspense fallback={<p>Loading...</p>}>{children}</Suspense>
      </QueryClientProvider>
    </Route>
  </MemoryRouter>
)

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

describe('PullBundleAnalysisTable', () => {
  function setup(
    { isEmptyList = false, nonComparisonType = false }: SetupArgs = {
      isEmptyList: false,
      nonComparisonType: false,
    }
  ) {
    const user = userEvent.setup()
    server.use(
      graphql.query('PullBundleList', (req, res, ctx) => {
        if (isEmptyList) {
          return res(ctx.status(200), ctx.data(mockEmptyPullBundleListData))
        } else if (nonComparisonType) {
          return res(ctx.status(200), ctx.data(mockNonComparisonTypeData))
        } else {
          return res(ctx.status(200), ctx.data(mockPullBundleListData))
        }
      })
    )

    return { user }
  }

  describe('there are bundles present', () => {
    describe('renders header', () => {
      it('renders name column', async () => {
        setup()
        render(<PullBundleAnalysisTable />, { wrapper })

        const nameColumn = await screen.findByText('Bundle name')
        expect(nameColumn).toBeInTheDocument()
      })

      it('renders previous size column', async () => {
        setup()
        render(<PullBundleAnalysisTable />, { wrapper })

        const prevSizeColumn = await screen.findByText('Previous size')
        expect(prevSizeColumn).toBeInTheDocument()
      })

      it('renders new size column', async () => {
        setup()
        render(<PullBundleAnalysisTable />, { wrapper })

        const newSizeColumn = await screen.findByText('New size')
        expect(newSizeColumn).toBeInTheDocument()
      })

      it('renders change column', async () => {
        setup()
        render(<PullBundleAnalysisTable />, { wrapper })

        const changeColumn = await screen.findByText('Change')
        expect(changeColumn).toBeInTheDocument()
      })
    })

    describe('renders rows', () => {
      it('renders bundle name', async () => {
        setup()
        render(<PullBundleAnalysisTable />, { wrapper })

        const bundleName = await screen.findByText('bundle.js')
        expect(bundleName).toBeInTheDocument()
      })

      it('renders previous size', async () => {
        setup()
        render(<PullBundleAnalysisTable />, { wrapper })

        const prevSize = await screen.findByText('3B')
        expect(prevSize).toBeInTheDocument()
      })

      it('renders new size', async () => {
        setup()
        render(<PullBundleAnalysisTable />, { wrapper })

        const newSize = await screen.findByText('2B')
        expect(newSize).toBeInTheDocument()
      })

      it('renders change', async () => {
        setup()
        render(<PullBundleAnalysisTable />, { wrapper })

        const change = await screen.findByText('+1B')
        expect(change).toBeInTheDocument()
      })
    })
  })

  describe('there are no bundles present', () => {
    it('renders no bundles message', async () => {
      setup({ isEmptyList: true })
      render(<PullBundleAnalysisTable />, { wrapper })

      const noBundlesMessage = await screen.findByText(
        'No bundles were found in this pull'
      )
      expect(noBundlesMessage).toBeInTheDocument()
    })
  })

  describe('non-comparison type is returned', () => {
    it('renders an empty document', async () => {
      setup({ nonComparisonType: true })

      const { container } = render(<PullBundleAnalysisTable />, { wrapper })

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
      graphql.query('PullBundleList', (req, res, ctx) => {
        if (nonComparisonType) {
          return res(ctx.status(200), ctx.data(mockNonComparisonTypeData))
        } else {
          return res(ctx.status(200), ctx.data(mockPullBundleListData))
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
