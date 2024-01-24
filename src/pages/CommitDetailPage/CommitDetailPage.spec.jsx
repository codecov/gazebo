import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { Suspense } from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

import CommitPage from './CommitDetailPage'

jest.mock('ui/TruncatedMessage/hooks')
jest.mock('./Header', () => () => 'Header')
jest.mock('./CommitCoverage', () => () => 'CommitCoverage')

const mockNotFoundCommit = {
  owner: {
    isCurrentUserPartOfOrg: false,
    repository: {
      __typename: 'Repository',
      commit: null,
    },
  },
}

const mockCommitPageData = {
  owner: {
    isCurrentUserPartOfOrg: true,
    repository: {
      __typename: 'Repository',
      commit: {
        commitid: 'e736f78b3cb5c8abb1d6b2ec5e5102de455f98ed',
      },
    },
  },
}

const server = setupServer()
const queryClient = new QueryClient({
  defaultOptions: { queries: { suspense: true } },
})

const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter
      initialEntries={[
        '/gh/test-org/test-repo/commit/e736f78b3cb5c8abb1d6b2ec5e5102de455f98ed',
      ]}
    >
      <Route path="/:provider/:owner/:repo/commit/:commit">
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

describe('CommitDetailPage', () => {
  function setup({ notFoundCommit = false } = { notFoundCommit: false }) {
    server.use(
      graphql.query('CommitPageData', (req, res, ctx) => {
        if (notFoundCommit) {
          return res(ctx.status(200), ctx.data(mockNotFoundCommit))
        }

        return res(ctx.status(200), ctx.data(mockCommitPageData))
      })
    )
  }

  describe('commit is found, and user is part of org', () => {
    describe('renders the breadcrumb', () => {
      it('renders owner crumb', async () => {
        setup()
        render(<CommitPage />, { wrapper })

        const ownerCrumb = await screen.findByRole('link', { name: 'test-org' })
        expect(ownerCrumb).toBeInTheDocument()
        expect(ownerCrumb).toHaveAttribute('href', '/gh/test-org')
      })

      it('renders repo crumb', async () => {
        setup()
        render(<CommitPage />, { wrapper })

        const repoCrumb = await screen.findByRole('link', { name: 'test-repo' })
        expect(repoCrumb).toBeInTheDocument()
        expect(repoCrumb).toHaveAttribute('href', '/gh/test-org/test-repo')
      })

      it('renders commits crumb', async () => {
        setup()
        render(<CommitPage />, { wrapper })

        const commitsCrumb = await screen.findByRole('link', {
          name: 'commits',
        })
        expect(commitsCrumb).toBeInTheDocument()
        expect(commitsCrumb).toHaveAttribute(
          'href',
          '/gh/test-org/test-repo/commits'
        )
      })

      it('renders commit sha crumb', async () => {
        setup()
        render(<CommitPage />, { wrapper })

        const shortSha = 'e736f78b3cb5c8abb1d6b2ec5e5102de455f98ed'.slice(0, 7)
        const commitShaCrumb = await screen.findByText(shortSha)
        expect(commitShaCrumb).toBeInTheDocument()
      })
    })

    it('renders the header component', async () => {
      setup()
      render(<CommitPage />, { wrapper })

      const header = await screen.findByText(/Header/)
      expect(header).toBeInTheDocument()
    })

    it('renders the CommitCoverage component', async () => {
      setup()
      render(<CommitPage />, { wrapper })

      const CommitCoverage = await screen.findByText(/CommitCoverage/)
      expect(CommitCoverage).toBeInTheDocument()
    })
  })

  describe('when commit is not found, and user is not part of org', () => {
    it('renders NotFound', async () => {
      setup({ notFoundCommit: true })
      render(<CommitPage />, { wrapper })

      const notFound = await screen.findByText('Not found')
      expect(notFound).toBeInTheDocument()
    })
  })
})
