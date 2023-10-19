import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { Suspense } from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

import NetworkErrorBoundary from 'layouts/shared/NetworkErrorBoundary'
import { TierNames } from 'services/tier'

import { RepoBreadcrumbProvider } from './context'
import RepoPage from './RepoPage'

jest.mock('./CommitsTab', () => () => 'CommitsTab')
jest.mock('./CoverageTab', () => () => 'CoverageTab')
jest.mock('./NewRepoTab', () => () => 'NewRepoTab')
jest.mock('./PullsTab', () => () => 'PullsTab')
jest.mock('./FlagsTab', () => () => 'FlagsTab')
jest.mock('./SettingsTab', () => () => 'SettingsTab')
jest.mock('shared/featureFlags')

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

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      suspense: true,
      retry: false,
    },
  },
})
const server = setupServer()
let testLocation

const wrapper =
  (initialEntries = '/gh/codecov/cool-repo') =>
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
  queryClient.clear()
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
    const user = userEvent.setup()

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
      })
    )

    return { user }
  }

  describe('there is no repo data', () => {
    beforeEach(() => setup({ hasRepoData: false }))
    it('renders not found', async () => {
      render(<RepoPage />, { wrapper: wrapper() })

      const notFound = await screen.findByText(/not found/i)
      expect(notFound).toBeInTheDocument()
    })
  })

  describe('testing tabs', () => {
    describe('user is part of org', () => {
      it('has a coverage tab', async () => {
        const { user } = setup()
        render(<RepoPage />, {
          wrapper: wrapper('/gh/codecov/cool-repo/flags'),
        })

        const tab = await screen.findByRole('link', { name: 'Coverage' })
        expect(tab).toBeInTheDocument()
        expect(tab).toHaveAttribute('href', '/gh/codecov/cool-repo')

        await user.click(tab)

        await waitFor(() =>
          expect(testLocation.pathname).toBe('/gh/codecov/cool-repo')
        )
      })

      it('has a flags tab', async () => {
        const { user } = setup()
        render(<RepoPage />, { wrapper: wrapper() })

        const tab = await screen.findByRole('link', { name: 'Flags' })
        expect(tab).toBeInTheDocument()
        expect(tab).toHaveAttribute('href', '/gh/codecov/cool-repo/flags')

        await user.click(tab)

        await waitFor(() =>
          expect(testLocation.pathname).toBe('/gh/codecov/cool-repo/flags')
        )
      })

      it('has a commits tab', async () => {
        const { user } = setup()
        render(<RepoPage />, { wrapper: wrapper() })

        const tab = await screen.findByRole('link', { name: 'Commits' })
        expect(tab).toBeInTheDocument()
        expect(tab).toHaveAttribute('href', '/gh/codecov/cool-repo/commits')

        await user.click(tab)

        await waitFor(() =>
          expect(testLocation.pathname).toBe('/gh/codecov/cool-repo/commits')
        )
      })

      it('has a pulls tab', async () => {
        const { user } = setup()
        render(<RepoPage />, { wrapper: wrapper() })

        const tab = await screen.findByRole('link', { name: 'Pulls' })
        expect(tab).toBeInTheDocument()
        expect(tab).toHaveAttribute('href', '/gh/codecov/cool-repo/pulls')

        await user.click(tab)

        await waitFor(() =>
          expect(testLocation.pathname).toBe('/gh/codecov/cool-repo/pulls')
        )
      })

      it('has a settings tab', async () => {
        const { user } = setup()
        render(<RepoPage />, { wrapper: wrapper() })

        const tab = await screen.findByRole('link', { name: 'Settings' })
        expect(tab).toBeInTheDocument()
        expect(tab).toHaveAttribute('href', '/gh/codecov/cool-repo/settings')

        await user.click(tab)

        await waitFor(() =>
          expect(testLocation.pathname).toBe('/gh/codecov/cool-repo/settings')
        )
      })
    })

    describe('user is part of org and has team tier', () => {
      it('has a coverage tab', async () => {
        const { user } = setup({
          tierValue: TierNames.TEAM,
          hasRepoData: true,
        })
        render(<RepoPage />, {
          wrapper: wrapper('/gh/codecov/cool-repo/flags'),
        })

        const tab = await screen.findByRole('link', { name: 'Coverage' })
        expect(tab).toBeInTheDocument()
        expect(tab).toHaveAttribute('href', '/gh/codecov/cool-repo')

        await user.click(tab)

        await waitFor(() =>
          expect(testLocation.pathname).toBe('/gh/codecov/cool-repo')
        )
      })

      it('does not have a flags tab', () => {
        setup({
          tierValue: TierNames.TEAM,
          hasRepoData: true,
        })
        render(<RepoPage />, { wrapper: wrapper() })

        const tab = screen.queryByRole('link', { name: 'Flags' })
        expect(tab).not.toBeInTheDocument()
      })

      it('has a commits tab', async () => {
        const { user } = setup({
          tierValue: TierNames.TEAM,
          hasRepoData: true,
        })
        render(<RepoPage />, { wrapper: wrapper() })

        const tab = await screen.findByRole('link', { name: 'Commits' })
        expect(tab).toBeInTheDocument()
        expect(tab).toHaveAttribute('href', '/gh/codecov/cool-repo/commits')

        await user.click(tab)

        await waitFor(() =>
          expect(testLocation.pathname).toBe('/gh/codecov/cool-repo/commits')
        )
      })

      it('has a pulls tab', async () => {
        const { user } = setup({
          tierValue: TierNames.TEAM,
          hasRepoData: true,
        })
        render(<RepoPage />, { wrapper: wrapper() })

        const tab = await screen.findByRole('link', { name: 'Pulls' })
        expect(tab).toBeInTheDocument()
        expect(tab).toHaveAttribute('href', '/gh/codecov/cool-repo/pulls')

        await user.click(tab)

        await waitFor(() =>
          expect(testLocation.pathname).toBe('/gh/codecov/cool-repo/pulls')
        )
      })

      it('has a settings tab', async () => {
        const { user } = setup({
          tierValue: TierNames.TEAM,
          hasRepoData: true,
        })
        render(<RepoPage />, { wrapper: wrapper() })

        const tab = await screen.findByRole('link', { name: 'Settings' })
        expect(tab).toBeInTheDocument()
        expect(tab).toHaveAttribute('href', '/gh/codecov/cool-repo/settings')

        await user.click(tab)

        await waitFor(() =>
          expect(testLocation.pathname).toBe('/gh/codecov/cool-repo/settings')
        )
      })
    })

    describe('user not part of an org', () => {
      beforeEach(() =>
        setup({
          hasRepoData: true,
          isCurrentUserPartOfOrg: false,
          isRepoPrivate: false,
          isRepoActive: true,
        })
      )

      it('does not have a settings tab', async () => {
        render(<RepoPage />, { wrapper: wrapper() })

        const coverageTab = await screen.findByText('CoverageTab')
        expect(coverageTab).toBeInTheDocument()

        const tab = screen.queryByRole('link', { name: 'Settings' })
        expect(tab).not.toBeInTheDocument()
      })
    })
  })

  describe('testing routes', () => {
    describe('repo has commits', () => {
      beforeEach(() => setup())

      describe('testing base path', () => {
        it('renders coverage tab', async () => {
          render(<RepoPage />, { wrapper: wrapper() })

          const coverage = await screen.findByText('CoverageTab')
          expect(coverage).toBeInTheDocument()
        })
      })

      describe('testing tree branch path', () => {
        it('renders coverage tab', async () => {
          render(<RepoPage />, {
            wrapper: wrapper('/gh/codecov/cool-repo/tree/main'),
          })

          const coverage = await screen.findByText('CoverageTab')
          expect(coverage).toBeInTheDocument()
        })
      })

      describe('testing tree branch with path path', () => {
        it('renders coverage tab', async () => {
          render(<RepoPage />, {
            wrapper: wrapper('/gh/codecov/cool-repo/tree/main/src'),
          })

          const coverage = await screen.findByText('CoverageTab')
          expect(coverage).toBeInTheDocument()
        })
      })

      describe('testing blob branch path', () => {
        it('renders coverage tab', async () => {
          render(<RepoPage />, {
            wrapper: wrapper('/gh/codecov/cool-repo/blob/main/file.js'),
          })

          const coverage = await screen.findByText('CoverageTab')
          expect(coverage).toBeInTheDocument()
        })
      })

      describe('testing flags path', () => {
        it('renders flags tab', async () => {
          render(<RepoPage />, {
            wrapper: wrapper('/gh/codecov/cool-repo/flags'),
          })

          const flags = await screen.findByText('FlagsTab')
          expect(flags).toBeInTheDocument()
        })
      })

      describe('testing commits path', () => {
        it('renders commits tab', async () => {
          render(<RepoPage />, {
            wrapper: wrapper('/gh/codecov/cool-repo/commits'),
          })

          const commits = await screen.findByText('CommitsTab')
          expect(commits).toBeInTheDocument()
        })
      })

      describe('testing pulls path', () => {
        it('renders pulls tab', async () => {
          render(<RepoPage />, {
            wrapper: wrapper('/gh/codecov/cool-repo/pulls'),
          })

          const pulls = await screen.findByText('PullsTab')
          expect(pulls).toBeInTheDocument()
        })
      })

      describe('testing compare path', () => {
        it('redirects pulls tab', async () => {
          render(<RepoPage />, {
            wrapper: wrapper('/gh/codecov/cool-repo/compare'),
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
          render(<RepoPage />, {
            wrapper: wrapper('/gh/codecov/cool-repo/settings'),
          })

          const settings = await screen.findByText('SettingsTab')
          expect(settings).toBeInTheDocument()
        })
      })

      describe('testing random path', () => {
        it('redirects user to base path', async () => {
          render(<RepoPage />, {
            wrapper: wrapper('/gh/codecov/cool-repo/blah'),
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
      beforeEach(() =>
        setup({
          isRepoActive: false,
          hasRepoData: true,
          isRepoActivated: false,
        })
      )

      it('renders new repo tab', async () => {
        render(<RepoPage />, { wrapper: wrapper() })

        const newRepoTab = await screen.findByText('NewRepoTab')
        expect(newRepoTab).toBeInTheDocument()
      })
    })

    describe('repo is deactivated', () => {
      beforeEach(() =>
        setup({ hasRepoData: true, isRepoActivated: false, isRepoActive: true })
      )

      it('renders deactivated repo page', async () => {
        render(<RepoPage />, { wrapper: wrapper() })

        const msg = await screen.findByText('This repo has been deactivated')
        expect(msg).toBeInTheDocument()
      })
    })
  })

  describe('testing breadcrumb', () => {
    beforeEach(() => setup({ hasRepoData: true, isRepoActive: true }))

    it('renders org breadcrumb', async () => {
      render(<RepoPage />, { wrapper: wrapper() })

      const orgCrumb = await screen.findByRole('link', { name: 'codecov' })
      expect(orgCrumb).toBeInTheDocument()
      expect(orgCrumb).toHaveAttribute('href', '/gh/codecov')
    })

    it('renders repo breadcrumb', async () => {
      render(<RepoPage />, { wrapper: wrapper() })

      const repoCrumb = await screen.findByText('cool-repo')
      expect(repoCrumb).toBeInTheDocument()
    })
  })

  describe('user is not activated and repo is private', () => {
    beforeEach(() =>
      setup({
        hasRepoData: true,
        isCurrentUserActivated: false,
        isRepoPrivate: true,
      })
    )

    it('renders unauthorized access error', async () => {
      render(<RepoPage />, { wrapper: wrapper() })

      const error = await screen.findByText('Unauthorized')
      expect(error).toBeInTheDocument()
    })
  })
})
