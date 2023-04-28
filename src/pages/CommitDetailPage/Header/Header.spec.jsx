import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import Header from './Header'

const mockData = (pullId) => ({
  owner: {
    repository: {
      commit: {
        author: {
          username: 'cool-user',
        },
        branchName: 'cool-branch',
        ciPassed: true,
        commitid: 'id-1',
        createdAt: '2022-01-01T12:59:59',
        message: 'Test Commit',
        pullId,
      },
    },
  },
})

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})
const server = setupServer()

const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter initialEntries={['/gh/codecov/test-repo/commit/id-1']}>
      <Route path="/:provider/:owner/:repo/commit/:commit">{children}</Route>
    </MemoryRouter>
  </QueryClientProvider>
)

beforeAll(() => server.listen())
afterEach(() => {
  queryClient.clear()
  server.resetHandlers()
})
afterAll(() => server.close())

describe('Header', () => {
  function setup(pullId = 1234) {
    server.use(
      graphql.query('CommitPageHeaderData', (req, res, ctx) =>
        res(ctx.status(200), ctx.data(mockData(pullId)))
      )
    )
  }

  describe('When rendered with valid values', () => {
    beforeEach(() => {
      setup()
    })

    it('renders commit message', async () => {
      render(<Header />, { wrapper })

      const message = await screen.findByText('Test Commit')
      expect(message).toBeInTheDocument()
    })

    it('The summary header', async () => {
      render(<Header />, { wrapper })

      const authored = await screen.findByText(/authored commit/)
      expect(authored).toBeInTheDocument()
    })

    it('renders commit id and link', async () => {
      render(<Header />, { wrapper })

      const commitLink = await screen.findByRole('link', {
        name: /id-1/i,
      })
      expect(commitLink).toBeInTheDocument()
      expect(commitLink.href).toBe(
        'https://github.com/codecov/test-repo/commit/id-1'
      )
    })

    it('renders CI Passed', async () => {
      render(<Header />, { wrapper })

      const ciPassed = await screen.findByText('CI Passed')
      expect(ciPassed).toBeInTheDocument()
    })

    it('renders branch name', async () => {
      render(<Header />, { wrapper })

      const branchName = await screen.findByText('cool-branch')
      expect(branchName).toBeInTheDocument()
    })
  })

  describe('renders with patch', () => {
    beforeEach(() => {
      setup(null)
    })

    it('does not render the pull label', async () => {
      render(<Header />, { wrapper })

      await waitFor(() => queryClient.isFetching)
      await waitFor(() => !queryClient.isFetching)

      const pullIcon = screen.queryByText(/pull-request-open.svg/)
      expect(pullIcon).not.toBeInTheDocument()
    })
  })
})
