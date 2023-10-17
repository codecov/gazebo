import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import { useFlags } from 'shared/featureFlags'

import PullRequestPageTabs from './PullRequestPageTabs'

jest.mock('shared/featureFlags')

const mockCommits = {
  owner: {
    repository: {
      commits: {
        totalCount: 11,
      },
    },
  },
}

const mockPullData = {
  owner: {
    isCurrentUserPartOfOrg: true,
    repository: {
      __typename: 'Repository',
      private: true,
      pull: {
        pullId: 1,
        head: {
          commitid: '123',
        },
        compareWithBase: {
          __typename: 'Comparison',
          directChangedFilesCount: 4,
          flagComparisonsCount: 3,
          indirectChangedFilesCount: 5,
          impactedFilesCount: 0,
          componentComparisonsCount: 0,
        },
      },
    },
  },
}

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})
const server = setupServer()

const wrapper =
  (initialEntries = '/gh/codecov/test-repo/pull/1') =>
  ({ children }) =>
    (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[initialEntries]}>
          <Route
            path={[
              '/:provider/:owner/:repo/pull/:pullId',
              '/:provider/:owner/:repo/pull/:pullId/tree',
              '/:provider/:owner/:repo/pull/:pullId/tree/:path+',
              '/:provider/:owner/:repo/pull/:pullId/blob/:path+',
            ]}
          >
            {children}
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

describe('PullRequestPageTabs', () => {
  function setup(
    { pullRequestPageFlagMultiSelect = false } = {
      pullRequestPageFlagMultiSelect: false,
    }
  ) {
    useFlags.mockReturnValue({
      pullRequestPageFlagMultiSelect,
    })
    server.use(
      graphql.query('PullPageData', (req, res, ctx) =>
        res(ctx.status(200), ctx.data(mockPullData))
      ),
      graphql.query('GetCommits', (req, res, ctx) =>
        res(ctx.status(200), ctx.data(mockCommits))
      ),
      graphql.query('BackfillFlagMemberships', (req, res, ctx) =>
        res(ctx.status(200), ctx.data({}))
      )
    )
  }

  describe('on base route', () => {
    describe('rendering files changed tab', () => {
      beforeEach(() => setup())

      it('renders link to root pull route', async () => {
        render(<PullRequestPageTabs />, { wrapper: wrapper() })

        const link = await screen.findByRole('link', { name: /Files changed/ })
        expect(link).toBeInTheDocument()
        expect(link).toHaveAttribute('href', '/gh/codecov/test-repo/pull/1')
      })

      it('renders the correct tab count', async () => {
        render(<PullRequestPageTabs />, { wrapper: wrapper() })

        const tabCount = await screen.findByText('4')
        expect(tabCount).toBeInTheDocument()
      })
    })

    describe('rendering indirect changes tab', () => {
      beforeEach(() => setup())

      it('renders link to indirect changes pull route', async () => {
        render(<PullRequestPageTabs />, { wrapper: wrapper() })

        const link = await screen.findByRole('link', {
          name: /Indirect changes/,
        })
        expect(link).toBeInTheDocument()
        expect(link).toHaveAttribute(
          'href',
          '/gh/codecov/test-repo/pull/1/indirect-changes'
        )
      })

      it('renders the correct tab count', async () => {
        render(<PullRequestPageTabs />, { wrapper: wrapper() })

        const tabCount = await screen.findByText('5')
        expect(tabCount).toBeInTheDocument()
      })
    })

    describe('rendering commits tab', () => {
      beforeEach(() => setup())

      it('renders link to commits pull route', async () => {
        render(<PullRequestPageTabs />, { wrapper: wrapper() })

        const link = await screen.findByRole('link', { name: /Commits/ })
        expect(link).toBeInTheDocument()
        expect(link).toHaveAttribute(
          'href',
          '/gh/codecov/test-repo/pull/1/commits'
        )
      })

      it('renders the correct tab count', async () => {
        render(<PullRequestPageTabs />, { wrapper: wrapper() })

        const tabCount = await screen.findByText('11')
        expect(tabCount).toBeInTheDocument()
      })
    })

    describe('rendering flags tab', () => {
      beforeEach(() => setup())

      it('renders link to flags pull route', async () => {
        render(<PullRequestPageTabs />, { wrapper: wrapper() })

        const link = await screen.findByRole('link', { name: /Flags/ })
        expect(link).toBeInTheDocument()
        expect(link).toHaveAttribute(
          'href',
          '/gh/codecov/test-repo/pull/1/flags'
        )
      })

      it('renders the correct tab count', async () => {
        render(<PullRequestPageTabs />, { wrapper: wrapper() })

        const tabCount = await screen.findByText('3')
        expect(tabCount).toBeInTheDocument()
      })
    })
  })

  describe('on file explorer route', () => {
    describe('on tree route', () => {
      beforeEach(() => setup())

      it('highlights file explorer tab', async () => {
        render(<PullRequestPageTabs />, {
          wrapper: wrapper('/gh/codecov/test-repo/pull/1/tree'),
        })

        const fileExplorer = await screen.findByText(/File explorer/)
        expect(fileExplorer).toBeInTheDocument()
        expect(fileExplorer).toHaveAttribute('aria-current', 'page')
      })

      it('does not highlight any other tab', async () => {
        render(<PullRequestPageTabs />, {
          wrapper: wrapper('/gh/codecov/test-repo/pull/1/tree'),
        })

        const filesChanged = await screen.findByText('Files changed')
        expect(filesChanged).toBeInTheDocument()
        expect(filesChanged).not.toHaveAttribute('aria-current', 'page')

        const indirectChanges = await screen.findByText('Indirect changes')
        expect(indirectChanges).toBeInTheDocument()
        expect(indirectChanges).not.toHaveAttribute('aria-current', 'page')

        const flags = await screen.findByText('Flags')
        expect(flags).toBeInTheDocument()
        expect(flags).not.toHaveAttribute('aria-current', 'page')

        const commits = await screen.findByText('Commits')
        expect(commits).toBeInTheDocument()
        expect(commits).not.toHaveAttribute('aria-current', 'page')
      })
    })

    describe('on a blob route', () => {
      beforeEach(() => setup())

      it('highlights files tab', async () => {
        render(<PullRequestPageTabs />, {
          wrapper: wrapper('/gh/codecov/test-repo/pull/1/blob/index.js'),
        })

        const fileExplorer = await screen.findByText(/File explorer/)
        expect(fileExplorer).toBeInTheDocument()
        expect(fileExplorer).toHaveAttribute('aria-current', 'page')
      })

      it('does not highlight any other tab', async () => {
        render(<PullRequestPageTabs />, {
          wrapper: wrapper('/gh/codecov/test-repo/pull/1/blob/index.js'),
        })

        const filesChanged = await screen.findByText('Files changed')
        expect(filesChanged).toBeInTheDocument()
        expect(filesChanged).not.toHaveAttribute('aria-current', 'page')

        const indirectChanges = await screen.findByText('Indirect changes')
        expect(indirectChanges).toBeInTheDocument()
        expect(indirectChanges).not.toHaveAttribute('aria-current', 'page')

        const flags = await screen.findByText('Flags')
        expect(flags).toBeInTheDocument()
        expect(flags).not.toHaveAttribute('aria-current', 'page')

        const commits = await screen.findByText('Commits')
        expect(commits).toBeInTheDocument()
        expect(commits).not.toHaveAttribute('aria-current', 'page')
      })
    })
  })

  describe('rendering toggle header legend', () => {
    beforeEach(() => setup())

    it('renders uncovered legend', async () => {
      render(<PullRequestPageTabs />, { wrapper: wrapper() })

      const legend = await screen.findByText('uncovered')
      expect(legend).toBeInTheDocument()
    })

    it('renders partial legend', async () => {
      render(<PullRequestPageTabs />, { wrapper: wrapper() })

      const legend = await screen.findByText('partial')
      expect(legend).toBeInTheDocument()
    })

    it('renders covered legend', async () => {
      render(<PullRequestPageTabs />, { wrapper: wrapper() })

      const legend = await screen.findByText('covered')
      expect(legend).toBeInTheDocument()
    })

    it('renders hit count legend', async () => {
      render(<PullRequestPageTabs />, { wrapper: wrapper() })

      const hitIcon = await screen.findByText('n')
      expect(hitIcon).toBeInTheDocument()

      const legend = await screen.findByText('upload #')
      expect(legend).toBeInTheDocument()
    })
  })

  // describe('flags select dropdown', () => {
  //   beforeEach(() => setup({ pullRequestPageFlagMultiSelect: true }))

  //   it('renders flags select dropdown', async () => {
  //     render(<PullRequestPageTabs />, { wrapper: wrapper() })

  //     const multiSelect = await screen.findByRole('button', {
  //       name: 'All Flags',
  //     })
  //     expect(multiSelect).toBeInTheDocument()
  //   })
  // })
})
