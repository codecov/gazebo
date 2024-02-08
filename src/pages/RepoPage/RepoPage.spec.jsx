import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { Suspense } from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

import NetworkErrorBoundary from 'layouts/shared/NetworkErrorBoundary'
import { TierNames } from 'services/tier'
import { useFlags } from 'shared/featureFlags'

import { RepoBreadcrumbProvider } from './context'
import RepoPage from './RepoPage'

jest.mock('./CommitsTab', () => () => 'CommitsTab')
jest.mock('./CoverageTab', () => () => 'CoverageTab')
jest.mock('./CoverageOnboarding', () => () => 'CoverageOnboarding')
jest.mock('./PullsTab', () => () => 'PullsTab')
jest.mock('./FlagsTab', () => () => 'FlagsTab')
jest.mock('./SettingsTab', () => () => 'SettingsTab')
jest.mock('shared/featureFlags')

jest.mock('shared/featureFlags')
const mockedUseFlags = useFlags

const mockGetRepo = (
  noUploadToken,
  isRepoPrivate = false,
  isRepoActivated = true,
  isCurrentUserPartOfOrg = true,
  isRepoActive = true
) => ({
  owner: {
    isCurrentUserPartOfOrg,
    repository: {
      private: isRepoPrivate,
      uploadToken: noUploadToken
        ? null
        : '9e6a6189-20f1-482d-ab62-ecfaa2629295',
      defaultBranch: 'main',
      yaml: '',
      activated: isRepoActivated,
      oldestCommitAt: '',
      active: isRepoActive,
    },
  },
})

const mockRepoOverview = {
  owner: {
    repository: {
      __typename: 'Repository',
      private: false,
      defaultBranch: 'main',
      oldestCommitAt: '2022-10-10T11:59:59',
      coverageEnabled: true,
      bundleAnalysisEnabled: true,
      languages: ['python', 'javascript'],
    },
  },
}

const server = setupServer()
let testLocation

const wrapper =
  ({ queryClient, initialEntries = '/gh/codecov/cool-repo' }) =>
  ({ children }) =>
    (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[initialEntries]}>
          <NetworkErrorBoundary>
            <Route
              path={[
                '/:provider/:owner/:repo/blob/:ref/:path+',
                '/:provider/:owner/:repo/commits',
                '/:provider/:owner/:repo/compare',
                '/:provider/:owner/:repo/flags',
                '/:provider/:owner/:repo/new',
                '/:provider/:owner/:repo/pulls',
                '/:provider/:owner/:repo/settings',
                '/:provider/:owner/:repo/tree/:branch',
                '/:provider/:owner/:repo/tree/:branch/:path+',
                '/:provider/:owner/:repo',
              ]}
            >
              <Suspense fallback={null}>
                <RepoBreadcrumbProvider>{children}</RepoBreadcrumbProvider>
              </Suspense>
            </Route>
            <Route
              path="*"
              render={({ location }) => {
                testLocation = location
                return null
              }}
            />
          </NetworkErrorBoundary>
        </MemoryRouter>
      </QueryClientProvider>
    )

beforeAll(() => {
  console.error = () => {}
  server.listen()
})
afterEach(() => {
  server.resetHandlers()
})
afterAll(() => server.close())

describe('RepoPage', () => {
  function setup(
    {
      noUploadToken,
      isCurrentUserPartOfOrg,
      hasRepoData,
      isRepoPrivate,
      isRepoActivated,
      isRepoActive,
      tierValue,
    } = {
      noUploadToken: false,
      isCurrentUserPartOfOrg: true,
      hasRepoData: true,
      isRepoPrivate: false,
      isRepoActivated: true,
      isRepoActive: true,
      tierValue: TierNames.PRO,
    }
  ) {
    mockedUseFlags.mockReturnValue({
      bundleAnalysisPrAndCommitPages: true,
    })

    const user = userEvent.setup()
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          suspense: true,
          retry: false,
        },
      },
    })

    server.use(
      graphql.query('GetRepo', (req, res, ctx) => {
        if (hasRepoData) {
          return res(
            ctx.status(200),
            ctx.data(
              mockGetRepo(
                noUploadToken,
                isRepoPrivate,
                isRepoActivated,
                isCurrentUserPartOfOrg,
                isRepoActive
              )
            )
          )
        }

        return res(ctx.status(200), ctx.data({ owner: {} }))
      }),
      graphql.query('OwnerTier', (req, res, ctx) => {
        if (tierValue === TierNames.TEAM) {
          return res(
            ctx.status(200),
            ctx.data({ owner: { plan: { tierName: TierNames.TEAM } } })
          )
        }
        return res(
          ctx.status(200),
          ctx.data({ owner: { plan: { tierName: TierNames.PRO } } })
        )
      }),
      graphql.query('GetRepoOverview', (req, res, ctx) => {
        return res(ctx.status(200), ctx.data(mockRepoOverview))
      })
    )

    return { queryClient, user }
  }

  describe('there is no repo data', () => {
    it('renders not found', async () => {
      const { queryClient } = setup({ hasRepoData: false })
      render(<RepoPage />, { wrapper: wrapper({ queryClient }) })

      const notFound = await screen.findByText(/not found/i)
      expect(notFound).toBeInTheDocument()
    })
  })

  describe('testing routes', () => {
    describe('repo has commits', () => {
      describe('testing base path', () => {
        it('renders coverage tab', async () => {
          const { queryClient } = setup()
          render(<RepoPage />, { wrapper: wrapper({ queryClient }) })

          const coverage = await screen.findByText('CoverageTab')
          expect(coverage).toBeInTheDocument()
        })
      })

      describe('testing tree branch path', () => {
        it('renders coverage tab', async () => {
          const { queryClient } = setup()
          render(<RepoPage />, {
            wrapper: wrapper({
              queryClient,
              initialEntries: '/gh/codecov/cool-repo/tree/main',
            }),
          })

          const coverage = await screen.findByText('CoverageTab')
          expect(coverage).toBeInTheDocument()
        })
      })

      describe('testing tree branch with path path', () => {
        it('renders coverage tab', async () => {
          const { queryClient } = setup()
          render(<RepoPage />, {
            wrapper: wrapper({
              queryClient,
              initialEntries: '/gh/codecov/cool-repo/tree/main/src',
            }),
          })

          const coverage = await screen.findByText('CoverageTab')
          expect(coverage).toBeInTheDocument()
        })
      })

      describe('testing blob branch path', () => {
        it('renders coverage tab', async () => {
          const { queryClient } = setup()
          render(<RepoPage />, {
            wrapper: wrapper({
              queryClient,
              initialEntries: '/gh/codecov/cool-repo/blob/main/file.js',
            }),
          })

          const coverage = await screen.findByText('CoverageTab')
          expect(coverage).toBeInTheDocument()
        })
      })

      describe('testing flags path', () => {
        it('renders flags tab', async () => {
          const { queryClient } = setup()
          render(<RepoPage />, {
            wrapper: wrapper({
              queryClient,
              initialEntries: '/gh/codecov/cool-repo/flags',
            }),
          })

          const flags = await screen.findByText('FlagsTab')
          expect(flags).toBeInTheDocument()
        })
      })

      describe('testing commits path', () => {
        it('renders commits tab', async () => {
          const { queryClient } = setup()
          render(<RepoPage />, {
            wrapper: wrapper({
              queryClient,
              initialEntries: '/gh/codecov/cool-repo/commits',
            }),
          })

          const commits = await screen.findByText('CommitsTab')
          expect(commits).toBeInTheDocument()
        })
      })

      describe('testing pulls path', () => {
        it('renders pulls tab', async () => {
          const { queryClient } = setup()
          render(<RepoPage />, {
            wrapper: wrapper({
              queryClient,
              initialEntries: '/gh/codecov/cool-repo/pulls',
            }),
          })

          const pulls = await screen.findByText('PullsTab')
          expect(pulls).toBeInTheDocument()
        })
      })

      describe('testing compare path', () => {
        it('redirects pulls tab', async () => {
          const { queryClient } = setup()
          render(<RepoPage />, {
            wrapper: wrapper({
              queryClient,
              initialEntries: '/gh/codecov/cool-repo/compare',
            }),
          })

          const pulls = await screen.findByText('PullsTab')
          expect(pulls).toBeInTheDocument()

          await waitFor(() =>
            expect(testLocation.pathname).toBe('/gh/codecov/cool-repo/pulls')
          )
        })
      })

      describe('testing settings path', () => {
        it('renders settings tab', async () => {
          const { queryClient } = setup()
          render(<RepoPage />, {
            wrapper: wrapper({
              queryClient,
              initialEntries: '/gh/codecov/cool-repo/settings',
            }),
          })

          const settings = await screen.findByText('SettingsTab')
          expect(settings).toBeInTheDocument()
        })
      })

      describe('testing random path', () => {
        it('redirects user to base path', async () => {
          const { queryClient } = setup()
          render(<RepoPage />, {
            wrapper: wrapper({
              queryClient,
              initialEntries: '/gh/codecov/cool-repo/blah',
            }),
          })

          const coverage = await screen.findByText('CoverageTab')
          expect(coverage).toBeInTheDocument()

          await waitFor(() =>
            expect(testLocation.pathname).toBe('/gh/codecov/cool-repo')
          )
        })
      })
    })

    describe('repo has no commits', () => {
      it('renders new repo tab', async () => {
        const { queryClient } = setup({
          isRepoActive: false,
          hasRepoData: true,
          isRepoActivated: false,
        })
        render(<RepoPage />, { wrapper: wrapper({ queryClient }) })

        const coverageOnboarding = await screen.findByText('CoverageOnboarding')
        expect(coverageOnboarding).toBeInTheDocument()
      })
    })

    describe('repo is deactivated', () => {
      it('renders deactivated repo page', async () => {
        const { queryClient } = setup({
          hasRepoData: true,
          isRepoActivated: false,
          isRepoActive: true,
        })
        render(<RepoPage />, { wrapper: wrapper({ queryClient }) })

        const msg = await screen.findByText('This repo has been deactivated')
        expect(msg).toBeInTheDocument()
      })
    })
  })

  describe('testing breadcrumb', () => {
    it('renders org breadcrumb', async () => {
      const { queryClient } = setup({ hasRepoData: true, isRepoActive: true })
      render(<RepoPage />, { wrapper: wrapper({ queryClient }) })

      const orgCrumb = await screen.findByRole('link', { name: 'codecov' })
      expect(orgCrumb).toBeInTheDocument()
      expect(orgCrumb).toHaveAttribute('href', '/gh/codecov')
    })

    it('renders repo breadcrumb', async () => {
      const { queryClient } = setup({ hasRepoData: true, isRepoActive: true })
      render(<RepoPage />, { wrapper: wrapper({ queryClient }) })

      const repoCrumb = await screen.findByText('cool-repo')
      expect(repoCrumb).toBeInTheDocument()
    })
  })

  describe('user is not activated and repo is private', () => {
    it('renders unauthorized access error', async () => {
      const { queryClient } = setup({
        hasRepoData: true,
        isCurrentUserActivated: false,
        isRepoPrivate: true,
      })
      render(<RepoPage />, { wrapper: wrapper({ queryClient }) })

      const error = await screen.findByText('Unauthorized')
      expect(error).toBeInTheDocument()
    })
  })
})
