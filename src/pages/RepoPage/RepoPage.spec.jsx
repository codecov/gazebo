import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { Suspense } from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

import { RepoBreadcrumbProvider } from './context'
import RepoPage from './RepoPage'

jest.mock('./CommitsTab', () => () => 'CommitsTab')
jest.mock('./CoverageTab', () => () => 'CoverageTab')
jest.mock('./NewRepoTab', () => () => 'NewRepoTab')
jest.mock('./PullsTab', () => () => 'PullsTab')
jest.mock('./FlagsTab', () => () => 'FlagsTab')
jest.mock('./SettingsTab', () => () => 'SettingsTab')

const mockOwner = (isCurrentUserPartOfOrg = true) => ({
  owner: {
    isCurrentUserPartOfOrg,
  },
})

const mockGetRepo = (
  noUploadToken,
  isRepoPrivate = false,
  isRepoActivated = true
) => ({
  owner: {
    isCurrentUserPartOfOrg: true,
    repository: {
      private: isRepoPrivate,
      uploadToken: noUploadToken
        ? null
        : '9e6a6189-20f1-482d-ab62-ecfaa2629295',
      defaultBranch: 'main',
      yaml: '',
      activated: isRepoActivated,
      oldestCommitAt: '',
    },
  },
})

const mockGetCommits = (hasCommits) => ({
  owner: {
    repository: {
      commits: {
        totalCount: 0,
        edges: hasCommits ? [{ node: { commitid: 1 } }] : [],
      },
    },
  },
})

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      suspense: true,
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
      hasCommits,
      noUploadToken,
      isCurrentUserPartOfOrg,
      hasRepoData,
      isRepoPrivate,
      isRepoActivated,
    } = {
      hasCommits: true,
      noUploadToken: false,
      isCurrentUserPartOfOrg: true,
      hasRepoData: true,
      isRepoPrivate: false,
      isRepoActivated: true,
    }
  ) {
    server.use(
      graphql.query('GetRepo', (req, res, ctx) => {
        if (hasRepoData) {
          return res(
            ctx.status(200),
            ctx.data(mockGetRepo(noUploadToken, isRepoPrivate, isRepoActivated))
          )
        }

        return res(ctx.status(200), ctx.data({ owner: {} }))
      }),
      graphql.query('GetCommits', (req, res, ctx) =>
        res(ctx.status(200), ctx.data(mockGetCommits(hasCommits)))
      ),
      graphql.query('DetailOwner', (req, res, ctx) =>
        res(ctx.status(200), ctx.data(mockOwner(isCurrentUserPartOfOrg)))
      )
    )
  }

  describe('there is no repo data', () => {
    beforeEach(() => setup({ hasRepoData: false }))
    it('renders not found', async () => {
      render(<RepoPage />, { wrapper: wrapper() })

      const notFound = await screen.findByText(/not found/i)
      expect(notFound).toBeInTheDocument()
    })
  })

  describe('the repo is private', () => {
    beforeEach(() =>
      setup({
        isRepoPrivate: true,
        isCurrentUserPartOfOrg: false,
        hasRepoData: true,
      })
    )
    it('renders not found', async () => {
      render(<RepoPage />, { wrapper: wrapper() })

      const notFound = await screen.findByText(/not found/i)
      expect(notFound).toBeInTheDocument()
    })
  })

  describe('testing tabs', () => {
    describe('user is part of org', () => {
      beforeEach(() => setup())

      it('has a coverage tab', async () => {
        render(<RepoPage />, {
          wrapper: wrapper('/gh/codecov/cool-repo/flags'),
        })

        const tab = await screen.findByRole('link', { name: 'Coverage' })
        expect(tab).toBeInTheDocument()
        expect(tab).toHaveAttribute('href', '/gh/codecov/cool-repo')

        userEvent.click(tab)

        await waitFor(() =>
          expect(testLocation.pathname).toBe('/gh/codecov/cool-repo')
        )
      })

      it('has a flags tab', async () => {
        render(<RepoPage />, { wrapper: wrapper() })

        const tab = await screen.findByRole('link', { name: 'Flags' })
        expect(tab).toBeInTheDocument()
        expect(tab).toHaveAttribute('href', '/gh/codecov/cool-repo/flags')

        userEvent.click(tab)

        await waitFor(() =>
          expect(testLocation.pathname).toBe('/gh/codecov/cool-repo/flags')
        )
      })

      it('has a commits tab', async () => {
        render(<RepoPage />, { wrapper: wrapper() })

        const tab = await screen.findByRole('link', { name: 'Commits' })
        expect(tab).toBeInTheDocument()
        expect(tab).toHaveAttribute('href', '/gh/codecov/cool-repo/commits')

        userEvent.click(tab)

        await waitFor(() =>
          expect(testLocation.pathname).toBe('/gh/codecov/cool-repo/commits')
        )
      })

      it('has a pulls tab', async () => {
        render(<RepoPage />, { wrapper: wrapper() })

        const tab = await screen.findByRole('link', { name: 'Pulls' })
        expect(tab).toBeInTheDocument()
        expect(tab).toHaveAttribute('href', '/gh/codecov/cool-repo/pulls')

        userEvent.click(tab)

        await waitFor(() =>
          expect(testLocation.pathname).toBe('/gh/codecov/cool-repo/pulls')
        )
      })

      it('has a settings tab', async () => {
        render(<RepoPage />, { wrapper: wrapper() })

        const tab = await screen.findByRole('link', { name: 'Settings' })
        expect(tab).toBeInTheDocument()
        expect(tab).toHaveAttribute('href', '/gh/codecov/cool-repo/settings')

        userEvent.click(tab)

        await waitFor(() =>
          expect(testLocation.pathname).toBe('/gh/codecov/cool-repo/settings')
        )
      })
    })

    describe('user not part of an org', () => {
      beforeEach(() =>
        setup({
          repository: {
            private: true,
            activated: false,
            active: false,
          },
        })
      })

      it('renders the coverage tab', () => {
        repoPageRender({
          renderRoot: () => (
            <Wrapper>
              <RepoPage />
            </Wrapper>
          ),
          renderNew: () => (
            <Wrapper>
              <RepoPage />
            </Wrapper>
          ),
        })

        const tab = screen.queryByText('Coverage')
        expect(tab).not.toBeInTheDocument()
      })

      it('renders the commits tab', () => {
        repoPageRender({
          renderNew: () => (
            <Wrapper>
              <RepoPage />
            </Wrapper>
          ),
        })

        const tab = screen.queryByText(/Commits/)
        expect(tab).not.toBeInTheDocument()
      })

      it('redirects to the setup repo page', async () => {
        repoPageRender({
          renderRoot: () => (
            <Wrapper>
              <RepoPage />
            </Wrapper>
          ),
          renderNew: () => (
            <Wrapper>
              <RepoPage />
            </Wrapper>
          ),
        })

        expect(await screen.findByText('NewRepoTab')).toBeInTheDocument()
      })
    })

    describe('when renders the commits page', () => {
      beforeEach(() => {
        setup({
          repository: {
            private: true,
            defaultBranch: 'main',
            activated: true,
            active: true,
          },
        })
      })

      it('renders the branch in the breadcrumb', async () => {
        repoPageRender({
          renderCommits: () => (
            <Wrapper>
              <RepoPage />
            </Wrapper>
          ),
          initialEntries: ['/gh/codecov/test-repo/commits'],
        })

        const branches = await screen.findAllByText(/main/i)
        expect(branches.length).toBe(2)
      })

      it('renders the branch context selector label', async () => {
        repoPageRender({
          renderCommits: () => (
            <Wrapper>
              <RepoPage />
            </Wrapper>
          ),
          initialEntries: ['/gh/codecov/test-repo/commits'],
        })

        const label = await screen.findByText('Branch Context')
        expect(label).toBeInTheDocument()
      })

      it('renders the branch context selector', async () => {
        repoPageRender({
          renderCommits: () => (
            <Wrapper>
              <RepoPage />
            </Wrapper>
          ),
          initialEntries: ['/gh/codecov/test-repo/commits'],
        })

        const select = await screen.findByRole('button', {
          name: 'Select branch',
        })
        expect(select).toBeInTheDocument()
      })
    })

    describe('when click on the selector in the commits page', () => {
      beforeEach(() => {
        setup({
          repository: {
            private: true,
            defaultBranch: 'main',
            activated: true,
            active: true,
          },
        })
      })

      it('renders the options of select branch', async () => {
        repoPageRender({
          renderCommits: () => (
            <Wrapper>
              <RepoPage />
            </Wrapper>
          ),
          initialEntries: ['/gh/codecov/test-repo/commits'],
        })

        const select = await screen.findByRole('button', {
          name: 'Select branch',
        })

        userEvent.click(select)

        const branch = await screen.findByText(/test1/)
        expect(branch).toBeInTheDocument()

        const branch2 = await screen.findByText(/test2/)
        expect(branch2).toBeInTheDocument()
      })
    })

    describe('when a branch is selected in the commits page', () => {
      beforeEach(async () => {
        setup({
          repository: {
            private: true,
            defaultBranch: 'main',
            activated: true,
            active: true,
          },
        })
      })

      it('renders the name of the branch in the breadcrumb', async () => {
        repoPageRender({
          renderCommits: () => (
            <Wrapper>
              <RepoPage />
            </Wrapper>
          ),
          initialEntries: ['/gh/codecov/test-repo/commits'],
        })

        const select = await screen.findByRole('button', {
          name: 'Select branch',
        })
        userEvent.click(select)

        const branch = await screen.findByText(/test1/)
        userEvent.click(branch)

        const branches = await screen.findAllByText(/test1/)
        expect(branches.length).toEqual(2)
      })
    })

    describe('when rendered with user not part of org', () => {
      beforeEach(() => {
        setup({
          repository: {
            private: false,
            activated: true,
            active: true,
          },
          isCurrentUserPartOfOrg: false,
          isRepoPrivate: false,
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

    describe('when repo is private and user is not a part of org', () => {
      beforeEach(() => {
        setup({
          repository: {
            private: true,
          },
          isCurrentUserPartOfOrg: false,
        })
      })

      it('shows not found', () => {
        repoPageRender({
          renderRoot: () => (
            <Wrapper>
              <RepoPage />
            </Wrapper>
          ),
        })

        const notFound = screen.getByText(/not found/i)
        expect(notFound).toBeInTheDocument()
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
        setup({ hasCommits: false, hasRepoData: true, isRepoActivated: false })
      )

      it('renders new repo tab', async () => {
        render(<RepoPage />, { wrapper: wrapper() })

        const newRepoTab = await screen.findByText('NewRepoTab')
        expect(newRepoTab).toBeInTheDocument()
      })
    })

    describe('repo is deactivated', () => {
      beforeEach(() =>
        setup({ hasRepoData: true, isRepoActivated: false, hasCommits: true })
      )

      it('renders deactivated repo page', async () => {
        render(<RepoPage />, { wrapper: wrapper() })

        const msg = await screen.findByText('This repo has been deactivated')
        expect(msg).toBeInTheDocument()
      })
    })
  })

  describe('testing breadcrumb', () => {
    beforeEach(() => setup({ hasRepoData: true, hasCommits: true }))

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
})
