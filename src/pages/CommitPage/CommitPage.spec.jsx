import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import { graphql, rest } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import CommitPage from './CommitPage'

jest.mock('./subroute/CommitFileExplorer', () => () => 'CommitFileExplorer')
jest.mock('./subroute/CommitFileViewer', () => () => 'CommitFileViewer')
jest.mock('./subroute/ImpactedFiles', () => () => 'ImpactedFiles')
jest.mock('./UploadsCard', () => () => 'UploadsCard')

const ciData = {
  provider: 'travis',
  createdAt: '2020-08-25T16:36:19.559474+00:00',
  updatedAt: '2020-08-25T16:36:19.679868+00:00',
  flags: [],
  downloadUrl:
    '/api/gh/febg/repo-test/download/build?path=v4/raw/2020-08-25/F84D6D9A7F883055E40E3B380280BC44/f00162848a3cebc0728d915763c2fd9e92132408/30582d33-de37-4272-ad50-c4dc805802fb.txt',
  ciUrl: 'https://travis-ci.com/febg/repo-test/jobs/721065746',
  uploadType: 'uploaded',
  errors: [],
  name: 'upload name',
}

const mockCommit = {
  owner: {
    repository: {
      commit: {
        totals: {
          coverage: 25,
          diff: {
            coverage: 0,
          },
        },
        commitid: 'e736f78b3cb5c8abb1d6b2ec5e5102de455f98ed',
        pullId: 10,
        createdAt: '2020-08-25T16:35:32',
        author: {
          username: 'febg',
        },
        state: 'complete',
        uploads: {
          edges: [
            {
              node: {
                state: 'processed',
                ...ciData,
              },
            },
            {
              node: {
                state: 'ERROR',
                ...ciData,
              },
            },
          ],
        },
        message: 'paths test',
        ciPassed: true,
        compareWithParent: {
          state: 'processed',
        },
        parent: {
          commitid: 'e736f78b3cb5c8abb1d6b2ec5e5102de455f98ea',
          totals: {
            coverage: 25,
          },
        },
      },
    },
  },
}

const mockCommitNoYamlErrors = {
  owner: {
    repository: {
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

const mockFileData = {
  owner: {
    repository: {
      commit: {
        compareWithParent: {
          state: 'processed',
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
      retry: false,
    },
  },
})
const server = setupServer()

let testLocation
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
            {children}
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
  server.resetHandlers()
})

afterAll(() => {
  server.close()
})

describe('CommitPage', () => {
  function setup(
    { hasYamlErrors, noCommit } = { hasYamlErrors: false, noCommit: false }
  ) {
    server.use(
      graphql.query('Commit', (req, res, ctx) => {
        if (noCommit) {
          return res(
            ctx.status(200),
            ctx.data({ owner: { repository: { commit: null } } })
          )
        }

        return res(ctx.status(200), ctx.data(mockCommit))
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
      graphql.query('CompareTotals', (req, res, ctx) => {
        res(ctx.status(200), ctx.data(mockFileData))
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

    describe('testing header', () => {
      beforeEach(() => {
        setup()
      })

      it('displays commit sha link', async () => {
        render(<CommitPage />, {
          wrapper: wrapper(),
        })

        const commitShaLink = await screen.findByRole('link', {
          name: /e736f78/,
        })
        expect(commitShaLink).toBeInTheDocument()
      })
    })

    describe('testing commit details summary', () => {
      beforeEach(() => {
        setup()
      })

      it('displays head change percentage', async () => {
        render(<CommitPage />, {
          wrapper: wrapper(),
        })

        const head = await screen.findByText(/HEAD/)
        expect(head).toBeInTheDocument()
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

    describe('testing uploads card', () => {
      beforeEach(() => {
        setup()
      })

      it('displays uploads card section', async () => {
        render(<CommitPage />, {
          wrapper: wrapper(),
        })

        const uploads = await screen.findByText('UploadsCard')
        expect(uploads).toBeInTheDocument()
      })
    })

    describe('testing errored uploads', () => {
      beforeEach(() => {
        setup()
      })

      it('displays errored uploads message', async () => {
        render(<CommitPage />, {
          wrapper: wrapper(),
        })

        const failedUploads = await screen.findByText(
          /The following uploads failed/
        )
        expect(failedUploads).toBeInTheDocument()
      })
    })

    describe('testing page tabs', () => {
      beforeEach(() => {
        setup()
      })

      it('displays the impacted files tab', async () => {
        render(<CommitPage />, {
          wrapper: wrapper(),
        })

        const impactedFiles = await screen.findByText('Impacted Files')
        expect(impactedFiles).toBeInTheDocument()
        expect(impactedFiles).toHaveAttribute(
          'href',
          '/gh/codecov/cool-repo/commit/e736f78b3cb5c8abb1d6b2ec5e5102de455f98ed'
        )
      })

      it('displays the files tab', async () => {
        render(<CommitPage />, {
          wrapper: wrapper(),
        })

        const filesTab = await screen.findByRole('link', { name: 'Files' })
        expect(filesTab).toBeInTheDocument()
        expect(filesTab).toHaveAttribute(
          'href',
          '/gh/codecov/cool-repo/commit/e736f78b3cb5c8abb1d6b2ec5e5102de455f98ed/tree'
        )
      })
    })
  })

  describe('testing sub-routes', () => {
    describe('rendering on root route', () => {
      beforeEach(() => {
        setup()
      })

      it('renders impacted files tab', async () => {
        render(<CommitPage />, {
          wrapper: wrapper(),
        })

        const impactedFiles = await screen.findByText('ImpactedFiles')
        expect(impactedFiles).toBeInTheDocument()
      })
    })

    describe('rendering on blob route', () => {
      beforeEach(() => {
        setup()
      })

      it('renders file viewer', async () => {
        render(<CommitPage />, {
          wrapper: wrapper([
            '/gh/codecov/cool-repo/commit/e736f78b3cb5c8abb1d6b2ec5e5102de455f98ed/blob/file.js',
          ]),
        })

        const fileViewer = await screen.findByText('CommitFileViewer')
        expect(fileViewer).toBeInTheDocument()
      })
    })

    describe('rendering on tree route', () => {
      beforeEach(() => {
        setup()
      })

      describe('on root tree route', () => {
        it('renders file explorer', async () => {
          render(<CommitPage />, {
            wrapper: wrapper([
              '/gh/codecov/cool-repo/commit/e736f78b3cb5c8abb1d6b2ec5e5102de455f98ed/tree',
            ]),
          })

          const fileExplorer = await screen.findByText('CommitFileExplorer')
          expect(fileExplorer).toBeInTheDocument()
        })
      })

      describe('on sub tree route', () => {
        it('renders file explorer', async () => {
          render(<CommitPage />, {
            wrapper: wrapper([
              '/gh/codecov/cool-repo/commit/e736f78b3cb5c8abb1d6b2ec5e5102de455f98ed/tree/a/b/c',
            ]),
          })

          const fileExplorer = await screen.findByText('CommitFileExplorer')
          expect(fileExplorer).toBeInTheDocument()
        })
      })
    })

    describe('rendering on random route', () => {
      beforeEach(() => {
        setup()
      })

      it('redirects the user to root route', async () => {
        render(<CommitPage />, {
          wrapper: wrapper([
            '/gh/codecov/cool-repo/commit/e736f78b3cb5c8abb1d6b2ec5e5102de455f98ed/random/route',
          ]),
        })
        await waitFor(() =>
          expect(testLocation.pathname).toBe(
            '/gh/codecov/cool-repo/commit/e736f78b3cb5c8abb1d6b2ec5e5102de455f98ed'
          )
        )
      })
    })
  })
})
