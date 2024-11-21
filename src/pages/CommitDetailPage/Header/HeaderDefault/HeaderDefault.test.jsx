import {
  QueryClientProvider as QueryClientProviderV5,
  QueryClient as QueryClientV5,
} from '@tanstack/react-queryV5'
import { render, screen, waitFor } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { Suspense } from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

import { useTruncation } from 'ui/TruncatedMessage/hooks'

import HeaderDefault from './HeaderDefault'

vi.mock('ui/TruncatedMessage/hooks')

const mockData = (pullId = null) => ({
  owner: {
    repository: {
      __typename: 'Repository',
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

const queryClientV5 = new QueryClientV5({
  defaultOptions: { queries: { retry: false } },
})
const server = setupServer()

const wrapper = ({ children }) => (
  <QueryClientProviderV5 client={queryClientV5}>
    <MemoryRouter initialEntries={['/gh/codecov/test-repo/commit/id-1']}>
      <Route path="/:provider/:owner/:repo/commit/:commit">
        <Suspense fallback={<p>Loading</p>}>{children}</Suspense>
      </Route>
    </MemoryRouter>
  </QueryClientProviderV5>
)

beforeAll(() => server.listen())
afterEach(() => {
  queryClientV5.clear()
  server.resetHandlers()
})
afterAll(() => server.close())

describe('HeaderDefault', () => {
  function setup(pullId = 1234) {
    useTruncation.mockImplementation(() => ({
      ref: () => {},
      canTruncate: false,
    }))

    server.use(
      graphql.query('CommitPageHeaderData', () => {
        return HttpResponse.json({ data: mockData(pullId) })
      })
    )
  }

  describe('When rendered with valid values', () => {
    beforeEach(() => {
      setup()
    })

    it('renders commit message', async () => {
      render(<HeaderDefault />, { wrapper })

      const message = await screen.findByText('Test Commit')
      expect(message).toBeInTheDocument()
    })

    it('The summary header', async () => {
      render(<HeaderDefault />, { wrapper })

      const authored = await screen.findByText(/authored commit/)
      expect(authored).toBeInTheDocument()
    })

    it('renders commit id and link', async () => {
      render(<HeaderDefault />, { wrapper })

      const commitLink = await screen.findByRole('link', {
        name: /id-1/i,
      })
      expect(commitLink).toBeInTheDocument()
      expect(commitLink.href).toBe(
        'https://github.com/codecov/test-repo/commit/id-1'
      )
    })

    it('renders CI Passed', async () => {
      render(<HeaderDefault />, { wrapper })

      const ciPassed = await screen.findByText('CI Passed')
      expect(ciPassed).toBeInTheDocument()
    })

    it('renders branch name', async () => {
      render(<HeaderDefault />, { wrapper })

      const branchName = await screen.findByText('cool-branch')
      expect(branchName).toBeInTheDocument()
    })
  })

  describe('renders with patch', () => {
    beforeEach(() => {
      setup(null)
    })

    it('does not render the pull label', async () => {
      render(<HeaderDefault />, { wrapper })

      await waitFor(() => queryClientV5.isFetching)
      await waitFor(() => !queryClientV5.isFetching)

      const pullIcon = screen.queryByText(/pull-request-open.svg/)
      expect(pullIcon).not.toBeInTheDocument()
    })
  })
})
