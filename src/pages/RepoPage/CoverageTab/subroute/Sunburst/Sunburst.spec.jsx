import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import Sunburst from './Sunburst'

jest.mock('ui/SunburstChart', () => () => 'Chart Mocked')

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
})
const server = setupServer()

const wrapper = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/gh/codecov/cool-repo']}>
        <Route path="/:provider/:owner/:repo">{children}</Route>
      </MemoryRouter>
    </QueryClientProvider>
  )
}

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

describe('Sunburst chart', () => {
  function setup() {
    server.use(
      graphql.query('GetRepoOverview', (req, res, ctx) => {
        return res(
          ctx.status(200),
          ctx.data({
            owner: { repository: { private: false, defaultBranch: 'main' } },
          })
        )
      }),
      graphql.query('GetBranches', (req, res, ctx) => {
        return res(
          ctx.status(200),
          ctx.data({
            owner: {
              repository: {
                branches: {
                  edges: [{ node: { name: 'main', head: { commitid: 1234 } } }],
                  pageInfo: {
                    hasNextPage: false,
                    endCursor: 'fwefesfesa',
                  },
                },
              },
            },
          })
        )
      })
    )
  }

  beforeEach(() => {
    setup()
  })

  it('renders something', () => {
    render(<Sunburst />, { wrapper })

    expect(screen.getByText('Chart Mocked')).toBeInTheDocument()
  })
})
