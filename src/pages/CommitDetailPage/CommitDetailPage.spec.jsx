import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import { graphql, rest } from 'msw'
import { setupServer } from 'msw/node'
import { Suspense } from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

import { useTruncation } from 'ui/TruncatedMessage/hooks'

import CommitPage from './CommitDetailPage'

jest.mock('./CommitDetailPageContent', () => () => 'CommitDetailPageContent')
jest.mock('./UploadsCard', () => () => 'UploadsCard')
jest.mock('ui/TruncatedMessage/hooks')

const mockCommit = {
  owner: {
    isCurrentUserPartOfOrg: true,
    repository: {
      __typename: 'Repository',
      commit: {
        commitid: '1',
      },
    },
  },
}

const mockCommitHeaderData = {
  owner: {
    repository: {
      __typename: 'Repository',
      commit: {
        author: {
          username: 'cool-user',
        },
        branchName: 'cool-branch',
        ciPassed: true,
        commitid: '1',
        createdAt: '2023-01-01T12:00:00.000000',
        message: 'Cool Commit Message',
        pullId: 1,
      },
    },
  },
}

const mockCommitNoYamlErrors = {
  owner: {
    repository: {
      __typename: 'Repository',
      commit: {
        yamlErrors: {
          edges: [],
        },
        botErrors: {
          edges: [],
        },
      },
    },
  },
}

const mockCommitYamlErrors = {
  owner: {
    repository: {
      __typename: 'Repository',
      commit: {
        yamlErrors: {
          edges: [{ node: { errorCode: 'invalid_yaml' } }],
        },
        botErrors: {
          edges: [{ node: { errorCode: 'repo_bot_invalid' } }],
        },
      },
    },
  },
}

const mockOwner = {
  owner: {
    isCurrentUserPartOfOrg: true,
  },
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      suspense: true,
      retry: false,
    },
  },
})
const server = setupServer()

const wrapper =
  (
    initialEntries = [
      '/gh/codecov/cool-repo/commit/e736f78b3cb5c8abb1d6b2ec5e5102de455f98ed',
    ]
  ) =>
  ({ children }) =>
    (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={initialEntries}>
          <Route
            path={[
              '/:provider/:owner/:repo/commit/:commit/blob/:path+',
              '/:provider/:owner/:repo/commit/:commit/tree/:path+',
              '/:provider/:owner/:repo/commit/:commit/tree/',
              '/:provider/:owner/:repo/commit/:commit/*',
              '/:provider/:owner/:repo/commit/:commit',
            ]}
          >
            <Suspense fallback={null}>{children}</Suspense>
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

describe('CommitPage', () => {
  function setup(
    { hasYamlErrors, noCommit } = { hasYamlErrors: false, noCommit: false }
  ) {
    useTruncation.mockImplementation(() => ({
      ref: () => {},
      canTruncate: false,
    }))

    server.use(
      graphql.query('Commit', (req, res, ctx) =>
        res(
          ctx.status(200),
          ctx.data({
            owner: { repository: { __typename: 'Repository', commit: null } },
          })
        )
      ),
      graphql.query('CommitPageData', (req, res, ctx) => {
        if (noCommit) {
          return res(
            ctx.status(200),
            ctx.data({
              owner: {
                isCurrentUserPartOfOrg: false,
                repository: { __typename: 'Repository', commit: null },
              },
            })
          )
        }

        return res(ctx.status(200), ctx.data(mockCommit))
      }),
      graphql.query('CommitPageHeaderData', (req, res, ctx) => {
        return res(ctx.status(200), ctx.data(mockCommitHeaderData))
      }),
      graphql.query('CommitErrors', (req, res, ctx) => {
        if (hasYamlErrors) {
          return res(ctx.status(200), ctx.data(mockCommitYamlErrors))
        }

        return res(ctx.status(200), ctx.data(mockCommitNoYamlErrors))
      }),
      graphql.query('DetailOwner', (req, res, ctx) => {
        return res(ctx.status(200), ctx.data(mockOwner))
      }),
      rest.get('/internal/gh/codecov/account-details/', (req, res, ctx) => {
        return res(ctx.status(200), ctx.json({}))
      })
    )
  }

  describe('rendering component', () => {
    describe('testing not found', () => {
      beforeEach(() => {
        setup({ noCommit: true })
      })

      it('renders not found page', async () => {
        render(<CommitPage />, {
          wrapper: wrapper(),
        })

        const notFound = await screen.findByText('Error 404')
        expect(notFound).toBeInTheDocument()
      })
    })

    describe('testing breadcrumb', () => {
      beforeEach(() => {
        setup()
      })

      it('renders owner link', async () => {
        render(<CommitPage />, {
          wrapper: wrapper(),
        })

        const ownerLink = await screen.findByRole('link', { name: 'codecov' })
        expect(ownerLink).toBeInTheDocument()
        expect(ownerLink).toHaveAttribute('href', '/gh/codecov')
      })

      it('renders repo link', async () => {
        render(<CommitPage />, {
          wrapper: wrapper(),
        })

        const ownerLink = await screen.findByRole('link', { name: 'cool-repo' })
        expect(ownerLink).toBeInTheDocument()
        expect(ownerLink).toHaveAttribute('href', '/gh/codecov/cool-repo')
      })

      it('renders commits page link', async () => {
        render(<CommitPage />, {
          wrapper: wrapper(),
        })

        const ownerLink = await screen.findByRole('link', { name: 'commits' })
        expect(ownerLink).toBeInTheDocument()
        expect(ownerLink).toHaveAttribute(
          'href',
          '/gh/codecov/cool-repo/commits'
        )
      })

      it('renders read only current short sha', async () => {
        render(<CommitPage />, {
          wrapper: wrapper(),
        })

        const ownerLink = await screen.findAllByText('e736f78')
        expect(ownerLink.length).toBeGreaterThanOrEqual(1)
      })
    })

    describe('testing commit error banners', () => {
      beforeEach(() => {
        setup({ hasYamlErrors: true })
      })

      it('displays bot error banner', async () => {
        render(<CommitPage />, {
          wrapper: wrapper(),
        })

        const teamBot = await screen.findByText(/Team bot/)
        expect(teamBot).toBeInTheDocument()
      })

      it('displays yaml error banner', async () => {
        render(<CommitPage />, {
          wrapper: wrapper(),
        })

        const yamlError = await screen.findByText('Commit YAML is invalid')
        expect(yamlError).toBeInTheDocument()
      })
    })

    describe('testing setting of query cache', () => {
      beforeEach(() => {
        setup({ hasYamlErrors: true })
      })

      it('sets ignore upload ids to empty array', async () => {
        render(<CommitPage />, {
          wrapper: wrapper(),
        })

        await waitFor(() =>
          expect(queryClient.getQueryData(['IgnoredUploadIds'])).toStrictEqual(
            []
          )
        )
      })
    })
  })
})
