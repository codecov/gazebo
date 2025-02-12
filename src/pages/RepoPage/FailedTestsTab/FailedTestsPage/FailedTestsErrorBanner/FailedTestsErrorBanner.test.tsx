import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { Suspense } from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

import { ErrorCodeEnum } from 'shared/utils/commit'

import FailedTestsErrorBanner from '../FailedTestsErrorBanner'

const server = setupServer()

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})

beforeAll(() => {
  server.listen()
})

afterEach(() => {
  vi.clearAllMocks()
  queryClient.clear()
  server.resetHandlers()
})

afterAll(() => {
  server.close()
})

const mockRepoOverview = {
  owner: {
    isCurrentUserActivated: true,
    repository: {
      __typename: 'Repository',
      private: false,
      defaultBranch: 'main',
      oldestCommitAt: '2022-10-10T11:59:59',
      coverageEnabled: true,
      bundleAnalysisEnabled: true,
      testAnalyticsEnabled: false,
      languages: ['javascript'],
    },
  },
}

const mockTestResultsTestSuites = ({
  errorCode,
  errorMessage,
}: {
  errorCode: string
  errorMessage: string
}) => ({
  owner: {
    repository: {
      __typename: 'Repository',
      testAnalytics: {
        testSuites: ['java', 'script'],
      },
      branch: {
        head: {
          latestUploadError: { errorCode, errorMessage },
        },
      },
    },
  },
})

const wrapper =
  (
    initialEntries = ['/repo/codecov/gazebo/branch/test']
  ): React.FC<React.PropsWithChildren> =>
  ({ children }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={initialEntries}>
        <Route path="/repo/:owner/:repo/branch/:branch">
          <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
        </Route>
      </MemoryRouter>
    </QueryClientProvider>
  )

describe('FailedTestsErrorBanner', () => {
  function setup({
    errorCode,
    errorMessage = 'File not found',
  }: {
    errorCode: string
    errorMessage?: string
  }) {
    server.use(
      graphql.query('GetRepoOverview', () => {
        return HttpResponse.json({
          data: mockRepoOverview,
        })
      }),
      graphql.query('GetTestResultsTestSuites', () => {
        return HttpResponse.json({
          data: mockTestResultsTestSuites({ errorCode, errorMessage }),
        })
      })
    )
  }

  it('renders nothing when unexpected error is provided', async () => {
    setup({ errorCode: ErrorCodeEnum.unknownProcessing })
    const { container } = render(<FailedTestsErrorBanner />, {
      wrapper: wrapper(),
    })

    await waitFor(() => queryClient.isFetching)
    await waitFor(() => !queryClient.isFetching)

    expect(container).toBeEmptyDOMElement()
  })

  it('renders file not found in storage error', async () => {
    setup({ errorCode: ErrorCodeEnum.fileNotFoundInStorage })
    render(<FailedTestsErrorBanner />, { wrapper: wrapper() })
    const banner = await screen.findByRole('heading', {
      name: 'JUnit XML file not found',
    })
    expect(banner).toBeInTheDocument()
  })

  it('renders processing timeout error', async () => {
    setup({ errorCode: ErrorCodeEnum.processingTimeout })
    render(<FailedTestsErrorBanner />, { wrapper: wrapper() })
    const banner = await screen.findByRole('heading', {
      name: 'Upload timeout',
    })
    expect(banner).toBeInTheDocument()
  })

  it('renders unsupported file format error', async () => {
    setup({ errorCode: ErrorCodeEnum.unsupportedFileFormat })
    render(<FailedTestsErrorBanner />, { wrapper: wrapper() })
    const banner = await screen.findByRole('heading', {
      name: 'Unsupported file format',
    })
    const content = await screen.findByText(
      /Please review the parser error message:/
    )
    const troubleshootingLink = await screen.findByRole('link', {
      name: 'troubleshooting guide',
    })

    expect(banner).toBeInTheDocument()
    expect(content).toBeInTheDocument()
    expect(troubleshootingLink).toBeInTheDocument()
    expect(troubleshootingLink).toHaveAttribute(
      'href',
      'https://docs.codecov.com/docs/test-analytics-beta#troubleshooting'
    )
  })

  describe('when error message is not provided for unsupported file format', () => {
    it('hides the review parser error message', async () => {
      setup({
        errorCode: ErrorCodeEnum.unsupportedFileFormat,
        errorMessage: '',
      })
      render(<FailedTestsErrorBanner />, { wrapper: wrapper() })

      await waitFor(() => queryClient.isFetching)
      await waitFor(() => !queryClient.isFetching)

      const banner = screen.queryByText(
        'Please review the parser error message:'
      )
      expect(banner).not.toBeInTheDocument()
    })
  })

  describe('when no branch is provided', () => {
    it('renders nothing', async () => {
      setup({ errorCode: ErrorCodeEnum.fileNotFoundInStorage })

      await waitFor(() => queryClient.isFetching)
      await waitFor(() => !queryClient.isFetching)

      const { container } = render(<FailedTestsErrorBanner />, {
        wrapper: wrapper(['/repo/owner/repo/']),
      })
      expect(container).toBeEmptyDOMElement()
    })
  })

  describe('when branch is the default branch', () => {
    it('renders nothing', async () => {
      setup({ errorCode: ErrorCodeEnum.fileNotFoundInStorage })

      await waitFor(() => queryClient.isFetching)
      await waitFor(() => !queryClient.isFetching)

      const { container } = render(<FailedTestsErrorBanner />, {
        wrapper: wrapper(['/repo/owner/repo/main']),
      })
      expect(container).toBeEmptyDOMElement()
    })
  })
})
