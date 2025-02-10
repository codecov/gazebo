import {
  QueryClientProvider as QueryClientProviderV5,
  QueryClient as QueryClientV5,
} from '@tanstack/react-queryV5'
import { render, screen, waitFor } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { Suspense } from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

import { ErrorCodeEnum } from 'shared/utils/commit'

import FailedTestsErrorBanner from '../FailedTestsErrorBanner'

const server = setupServer()

beforeAll(() => {
  server.listen()
})

afterEach(() => {
  vi.clearAllMocks()
  queryClientV5.clear()
  server.resetHandlers()
})

afterAll(() => {
  server.close()
})
const mockCommitUploadsErrors = (errorCode: string) => ({
  owner: {
    repository: {
      __typename: 'Repository',
      branch: {
        head: {
          uploads: {
            edges: [
              {
                node: {
                  errors: {
                    edges: [
                      {
                        node: {
                          errorCode,
                        },
                      },
                    ],
                  },
                },
              },
            ],
          },
        },
      },
    },
  },
})

const queryClientV5 = new QueryClientV5({
  defaultOptions: { queries: { retry: false } },
})

const wrapper =
  (
    initialEntries = ['/repo/codecov/gazebo/branch/main']
  ): React.FC<React.PropsWithChildren> =>
  ({ children }) => (
    <QueryClientProviderV5 client={queryClientV5}>
      <MemoryRouter initialEntries={initialEntries}>
        <Route path="/repo/:owner/:repo/branch/:branch">
          <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
        </Route>
      </MemoryRouter>
    </QueryClientProviderV5>
  )

describe('FailedTestsErrorBanner', () => {
  function setup({ errorCode }: { errorCode: string }) {
    server.use(
      graphql.query('CommitUploadsErrors', () => {
        return HttpResponse.json({ data: mockCommitUploadsErrors(errorCode) })
      })
    )
  }

  it('renders nothing when unexpected error is provided', async () => {
    setup({ errorCode: ErrorCodeEnum.unknownProcessing })
    const { container } = render(<FailedTestsErrorBanner />, {
      wrapper: wrapper(),
    })

    await waitFor(() => queryClientV5.isFetching)
    await waitFor(() => !queryClientV5.isFetching)

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
    expect(banner).toBeInTheDocument()
  })

  describe('when no branch is provided', () => {
    it('renders nothing', async () => {
      setup({ errorCode: ErrorCodeEnum.fileNotFoundInStorage })

      await waitFor(() => queryClientV5.isFetching)
      await waitFor(() => !queryClientV5.isFetching)

      const { container } = render(<FailedTestsErrorBanner />, {
        wrapper: wrapper(['/repo/owner/repo/']),
      })
      expect(container).toBeEmptyDOMElement()
    })
  })
})
