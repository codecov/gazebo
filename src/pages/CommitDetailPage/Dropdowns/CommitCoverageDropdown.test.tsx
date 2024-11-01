import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { Suspense } from 'react'
import { MemoryRouter, Route } from 'react-router-dom'
import { z } from 'zod'

import { RequestSchema } from 'services/commit/useCommitCoverageDropdownSummary'
import SummaryDropdown from 'ui/SummaryDropdown'

import CommitCoverageDropdown from './CommitCoverageDropdown'

const mockSummaryData = (
  patchTotals: {
    missesCount: number | null
    partialsCount: number | null
  },
  uploadState: 'COMPLETE' | 'ERROR',
  multipleUploads: boolean
) => {
  const uploads = [{ node: { state: uploadState } }]
  if (multipleUploads) {
    uploads.push({
      node: {
        state: uploadState,
      },
    })
  }

  return {
    owner: {
      repository: {
        __typename: 'Repository',
        commit: {
          compareWithParent: {
            __typename: 'Comparison',
            patchTotals,
          },
          uploads: {
            edges: uploads,
          },
        },
      },
    },
  } as z.infer<typeof RequestSchema>
}

const mockNoData = { owner: null }

const mockFirstPullRequest = {
  owner: {
    repository: {
      __typename: 'Repository',
      commit: {
        compareWithParent: {
          __typename: 'FirstPullRequest',
          message: 'First pull request',
        },
      },
    },
  },
}

const mockComparisonError = {
  owner: {
    repository: {
      __typename: 'Repository',
      commit: {
        compareWithParent: {
          __typename: 'MissingHeadCommit',
          message: 'Missing head commit',
        },
      },
    },
  },
}

const mockYamlError = {
  owner: {
    repository: {
      __typename: 'Repository',
      commit: {
        compareWithParent: {
          __typename: 'FirstPullRequest',
          message: 'First pull request',
        },
        yamlErrors: {
          edges: [{ node: { errorCode: 'invalid_yaml' } }],
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
        '/gh/codecov/test-repo/commit/803897e6ceeb6828778070208c06c5a978a48a68',
      ]}
    >
      <Route path="/:provider/:owner/:repo/commit/:commit">
        <Suspense fallback={<div>Loading...</div>}>
          <SummaryDropdown type="single">{children}</SummaryDropdown>
        </Suspense>
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
  noData?: boolean
  comparisonError?: boolean
  patchTotals?: {
    missesCount: number | null
    partialsCount: number | null
  }
  uploadState?: 'COMPLETE' | 'ERROR'
  multipleUploads?: boolean
  firstPullRequest?: boolean
  hasYamlError?: boolean
}

describe('CommitCoverageDropdown', () => {
  function setup({
    noData = false,
    comparisonError = false,
    patchTotals = {
      missesCount: 0,
      partialsCount: 0,
    },
    uploadState = 'COMPLETE',
    multipleUploads = false,
    firstPullRequest = false,
    hasYamlError = false,
  }: SetupArgs = {}) {
    const user = userEvent.setup()

    server.use(
      graphql.query('CommitDropdownSummary', (info) => {
        if (noData) {
          return HttpResponse.json({ data: mockNoData })
        } else if (comparisonError) {
          return HttpResponse.json({ data: mockComparisonError })
        } else if (firstPullRequest) {
          return HttpResponse.json({ data: mockFirstPullRequest })
        } else if (hasYamlError) {
          return HttpResponse.json({ data: mockYamlError })
        }

        return HttpResponse.json({
          data: mockSummaryData(patchTotals, uploadState, multipleUploads),
        })
      })
    )

    return { user }
  }

  describe('renders summary message', () => {
    describe('there are errored uploads', () => {
      describe('there is one errored upload', () => {
        it('renders errored upload message', async () => {
          setup({
            patchTotals: {
              missesCount: 0,
              partialsCount: 0,
            },
            uploadState: 'ERROR',
          })
          render(
            <CommitCoverageDropdown>
              <p>Passed child</p>
            </CommitCoverageDropdown>,
            { wrapper }
          )

          const bundleReport = await screen.findByText(/Coverage report:/)
          expect(bundleReport).toBeInTheDocument()

          const singleUploadError = await screen.findByText(
            /1 upload has failed to process/
          )
          expect(singleUploadError).toBeInTheDocument()
        })
      })

      describe('there are multiple errored uploads', () => {
        it('renders errored upload message', async () => {
          setup({
            patchTotals: {
              missesCount: 0,
              partialsCount: 0,
            },
            uploadState: 'ERROR',
            multipleUploads: true,
          })
          render(
            <CommitCoverageDropdown>
              <p>Passed child</p>
            </CommitCoverageDropdown>,
            { wrapper }
          )

          const bundleReport = await screen.findByText(/Coverage report:/)
          expect(bundleReport).toBeInTheDocument()

          const singleUploadError = await screen.findByText(
            /2 uploads have failed to process/
          )
          expect(singleUploadError).toBeInTheDocument()
        })
      })
    })

    describe('there are missing lines', () => {
      it('renders missing lines message', async () => {
        setup({
          patchTotals: {
            missesCount: 10,
            partialsCount: 10,
          },
        })
        render(
          <CommitCoverageDropdown>
            <p>Passed child</p>
          </CommitCoverageDropdown>,
          { wrapper }
        )

        const bundleReport = await screen.findByText(/Coverage report:/)
        expect(bundleReport).toBeInTheDocument()

        const increaseMessage = await screen.findByText(
          /20 lines in your changes are missing coverage/
        )
        expect(increaseMessage).toBeInTheDocument()
      })
    })

    describe('there is one missing line', () => {
      it('renders non-plural missing line message', async () => {
        setup({
          patchTotals: {
            missesCount: 1,
            partialsCount: 0,
          },
        })
        render(
          <CommitCoverageDropdown>
            <p>Passed child</p>
          </CommitCoverageDropdown>,
          { wrapper }
        )

        const bundleReport = await screen.findByText(/Coverage report:/)
        expect(bundleReport).toBeInTheDocument()

        const increaseMessage = await screen.findByText(
          /1 line in your changes is missing coverage/
        )
        expect(increaseMessage).toBeInTheDocument()
      })
    })

    describe('there is no missing lines', () => {
      it('renders all lines covered message', async () => {
        setup({
          patchTotals: {
            missesCount: 0,
            partialsCount: 0,
          },
        })
        render(
          <CommitCoverageDropdown>
            <p>Passed child</p>
          </CommitCoverageDropdown>,
          { wrapper }
        )

        const bundleReport = await screen.findByText(/Coverage report:/)
        expect(bundleReport).toBeInTheDocument()

        const noChangeMessage = await screen.findByText(
          /all modified lines are covered by tests/
        )
        expect(noChangeMessage).toBeInTheDocument()
      })
    })

    describe('patch totals are null', () => {
      it('renders all lines covered message', async () => {
        setup({
          patchTotals: {
            missesCount: null,
            partialsCount: null,
          },
        })
        render(
          <CommitCoverageDropdown>
            <p>Passed child</p>
          </CommitCoverageDropdown>,
          { wrapper }
        )

        const bundleReport = await screen.findByText(/Coverage report:/)
        expect(bundleReport).toBeInTheDocument()

        const noChangeMessage = await screen.findByText(
          /all modified lines are covered by tests/
        )
        expect(noChangeMessage).toBeInTheDocument()
      })
    })
  })

  describe('there is no data', () => {
    it('renders unknown error message', async () => {
      setup({ noData: true })
      render(
        <CommitCoverageDropdown>
          <p>Passed child</p>
        </CommitCoverageDropdown>,
        { wrapper }
      )

      const errorMessage = await screen.findByText(
        /an unknown error has occurred/
      )
      expect(errorMessage).toBeInTheDocument()
    })
  })

  describe('there is a first pull request', () => {
    it('renders the first pull message', async () => {
      setup({ firstPullRequest: true })
      render(
        <CommitCoverageDropdown>
          <p>Passed child</p>
        </CommitCoverageDropdown>,
        { wrapper }
      )

      const errorMsg = await screen.findByText(
        /once merged to default, your following pull request and commits will include report details/
      )
      expect(errorMsg).toBeInTheDocument()
    })
  })

  describe('there is a comparison error', () => {
    it('renders the passed error message', async () => {
      setup({ comparisonError: true })
      render(
        <CommitCoverageDropdown>
          <p>Passed child</p>
        </CommitCoverageDropdown>,
        { wrapper }
      )

      const errorMsg = await screen.findByText(/missing head commit/)
      expect(errorMsg).toBeInTheDocument()
    })
  })

  describe('there is a yaml error', () => {
    it('renders the yaml error message', async () => {
      setup({ hasYamlError: true })
      render(
        <CommitCoverageDropdown>
          <p>Passed child</p>
        </CommitCoverageDropdown>,
        { wrapper }
      )

      const errorMsg = await screen.findByText(
        /data unavailable due to invalid yaml/
      )
      expect(errorMsg).toBeInTheDocument()
    })
  })

  describe('expanding the dropdown', () => {
    it('renders the passed children', async () => {
      const { user } = setup({
        patchTotals: {
          missesCount: 10,
          partialsCount: 10,
        },
      })
      render(
        <CommitCoverageDropdown>
          <p>Passed child</p>
        </CommitCoverageDropdown>,
        { wrapper }
      )

      const bundleReport = await screen.findByText(/Coverage report:/)
      expect(bundleReport).toBeInTheDocument()
      await user.click(bundleReport)

      const passedChild = await screen.findByText(/Passed child/)
      expect(passedChild).toBeInTheDocument()
    })
  })
})
