import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import Header from './HeaderDefault'

const mockPullData = {
  owner: {
    repository: {
      __typename: 'Repository',
      pull: {
        pullId: 1,
        title: 'Cool Pull Request',
        state: 'OPEN',
        author: {
          username: 'cool-user',
        },
        head: {
          branchName: 'cool-branch',
          ciPassed: true,
        },
        updatestamp: '2020-01-01T12:00:00.000000',
      },
    },
  },
}

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})
const server = setupServer()
const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter initialEntries={['/gh/test-org/test-repo/pull/12']}>
      <Route path="/:provider/:owner/:repo/pull/:pullId">{children}</Route>
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

describe('Header', () => {
  function setup() {
    server.use(
      graphql.query('PullHeadData', (req, res, ctx) =>
        res(ctx.status(200), ctx.data(mockPullData))
      )
    )
  }

  describe('when rendered', () => {
    beforeEach(() => {
      setup()
    })

    it('renders the pr overview', async () => {
      render(<Header />, { wrapper })

      await waitFor(() => queryClient.isFetching)
      await waitFor(() => !queryClient.isFetching)

      const heading = await screen.findByRole('heading', {
        name: /Cool Pull Request/,
      })
      expect(heading).toBeInTheDocument()

      const open = await screen.findByText(/open/i)
      expect(open).toBeInTheDocument()

      const prNumber = await screen.findByText(/#1/i)
      expect(prNumber).toBeInTheDocument()
    })
  })
})
