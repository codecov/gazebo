import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  render,
  screen,
  waitForElementToBeRemoved,
} from '@testing-library/react'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { Suspense } from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

import CommitBundleAnalysis from './CommitBundleAnalysis'

jest.mock('./CommitBundleAnalysisTable', () => () => (
  <div>CommitBundleAnalysisTable</div>
))

const mockCommitPageData = ({
  bundleAnalysisEnabled = true,
  coverageEnabled = true,
}: {
  bundleAnalysisEnabled?: boolean
  coverageEnabled?: boolean
}) => ({
  owner: {
    isCurrentUserPartOfOrg: true,
    repository: {
      __typename: 'Repository',
      bundleAnalysisEnabled,
      coverageEnabled,
      commit: {
        commitid: 'e736f78b3cb5c8abb1d6b2ec5e5102de455f98ed',
      },
    },
  },
})

const mockSummaryData = (sizeDelta: number) => ({
  owner: {
    repository: {
      __typename: 'Repository',
      commit: {
        bundleAnalysisCompareWithParent: {
          __typename: 'BundleAnalysisComparison',
          sizeDelta,
          loadTimeDelta: 0,
        },
      },
    },
  },
})

const mockNoData = { owner: null }

const mockNoComparison = {
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

const server = setupServer()
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      suspense: true,
    },
  },
})

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter
      initialEntries={[
        '/gh/test-org/test-repo/commit/e736f78b3cb5c8abb1d6b2ec5e5102de455f98ed',
      ]}
    >
      <Route path="/:provider/:owner/:repo/commit/:commit">
        <Suspense fallback={<p>Loading...</p>}>{children}</Suspense>
      </Route>
    </MemoryRouter>
  </QueryClientProvider>
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
  bundleAnalysisEnabled?: boolean
  coverageEnabled?: boolean
  sizeDelta?: number
  noData?: boolean
  noBundleAnalysisComparison?: boolean
}

describe('CommitBundleAnalysis', () => {
  function setup(
    {
      coverageEnabled = true,
      bundleAnalysisEnabled = true,
      sizeDelta = 0,
      noData = false,
      noBundleAnalysisComparison = false,
    }: SetupArgs = {
      coverageEnabled: true,
      bundleAnalysisEnabled: true,
      sizeDelta: 0,
      noData: false,
      noBundleAnalysisComparison: false,
    }
  ) {
    server.use(
      graphql.query('CommitPageData', (req, res, ctx) => {
        return res(
          ctx.status(200),
          ctx.data(
            mockCommitPageData({
              coverageEnabled,
              bundleAnalysisEnabled,
            })
          )
        )
      }),
      graphql.query('CommitBADropdownSummary', (req, res, ctx) => {
        if (noData) {
          return res(ctx.status(200), ctx.data(mockNoData))
        } else if (noBundleAnalysisComparison) {
          return res(ctx.status(200), ctx.data(mockNoComparison))
        }

        return res(ctx.status(200), ctx.data(mockSummaryData(sizeDelta)))
      })
    )
  }

  describe('both coverage and bundle analysis is enabled', () => {
    it('renders only CommitBundleAnalysisTable', async () => {
      setup({ coverageEnabled: true, bundleAnalysisEnabled: true })
      render(<CommitBundleAnalysis />, { wrapper })

      const commitBundleAnalysisTable = await screen.findByText(
        'CommitBundleAnalysisTable'
      )
      expect(commitBundleAnalysisTable).toBeInTheDocument()
    })
  })

  describe('bundle analysis is only enabled', () => {
    describe('renders summary message', () => {
      describe('there is a positive size delta', () => {
        it('renders increase summary message', async () => {
          setup({
            sizeDelta: 10000,
            coverageEnabled: false,
            bundleAnalysisEnabled: true,
          })
          render(<CommitBundleAnalysis />, { wrapper })

          const bundleReport = await screen.findByText(/Bundle Report:/)
          expect(bundleReport).toBeInTheDocument()

          const increaseMessage = await screen.findByText(
            /changes will increase total bundle size by 10kB/
          )
          expect(increaseMessage).toBeInTheDocument()
        })
      })

      describe('there is a negative size delta', () => {
        it('renders decrease summary message', async () => {
          setup({
            sizeDelta: -10000,
            coverageEnabled: false,
            bundleAnalysisEnabled: true,
          })
          render(<CommitBundleAnalysis />, { wrapper })

          const bundleReport = await screen.findByText(/Bundle Report:/)
          expect(bundleReport).toBeInTheDocument()

          const decreaseMessage = await screen.findByText(
            /changes will decrease total bundle size by 10kB/
          )
          expect(decreaseMessage).toBeInTheDocument()
        })
      })

      describe('there is no size delta', () => {
        it('renders no change summary message', async () => {
          setup({
            sizeDelta: 0,
            coverageEnabled: false,
            bundleAnalysisEnabled: true,
          })
          render(<CommitBundleAnalysis />, { wrapper })

          const bundleReport = await screen.findByText(/Bundle Report:/)
          expect(bundleReport).toBeInTheDocument()

          const noChangeMessage = await screen.findByText(
            /bundle size has no change/
          )
          expect(noChangeMessage).toBeInTheDocument()
        })
      })

      describe('there is no data', () => {
        it('does not render', async () => {
          setup({
            noData: true,
            coverageEnabled: false,
            bundleAnalysisEnabled: true,
          })
          const { container } = render(<CommitBundleAnalysis />, { wrapper })

          const loading = await screen.findByText('Loading...')
          await waitForElementToBeRemoved(loading)

          // disabling this rule because we need to check if the paragraph is empty and findByRole does not work
          // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
          const paragraph = container.querySelector('p')
          expect(paragraph).toHaveTextContent('')
        })
      })

      describe('there is no bundle analysis comparison', () => {
        it('does not render', async () => {
          setup({
            noBundleAnalysisComparison: true,
            coverageEnabled: false,
            bundleAnalysisEnabled: true,
          })
          const { container } = render(<CommitBundleAnalysis />, { wrapper })

          const loading = await screen.findByText('Loading...')
          await waitForElementToBeRemoved(loading)

          // disabling this rule because we need to check if the paragraph is empty and findByRole does not work
          // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
          const paragraph = container.querySelector('p')
          expect(paragraph).toHaveTextContent('')
        })
      })
    })

    it('renders CommitBundleAnalysisTable', async () => {
      setup({ coverageEnabled: false, bundleAnalysisEnabled: true })
      render(<CommitBundleAnalysis />, { wrapper })

      const commitBundleAnalysisTable = await screen.findByText(
        'CommitBundleAnalysisTable'
      )
      expect(commitBundleAnalysisTable).toBeInTheDocument()
    })
  })
})
