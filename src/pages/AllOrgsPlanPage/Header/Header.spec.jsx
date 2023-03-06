import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import Header from './Header'

const queryClient = new QueryClient()
const server = setupServer()

const wrapper =
  (initialEntries = ['/plan/gh']) =>
  ({ children }) =>
    (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={initialEntries}>
          <Route path="/plan/:provider">{children}</Route>
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
  function setup() {
    server.use(
      graphql.query('MyContexts', (req, res, ctx) => {
        const hasNextPage = req.variables?.after ? false : true
        const endCursor = req.variables?.after ? 'second' : 'first'

        const queryData = {
          me: {
            owner: {
              username: 'cool-user',
              avatarUrl: '',
            },
            myOrganizations: {
              edges: [{ node: { username: 'org1', avatarUrl: '' } }],
              pageInfo: {
                hasNextPage,
                endCursor,
              },
            },
          },
        }

        return res(ctx.status(200), ctx.data(queryData))
      })
    )
  }

  beforeEach(() => setup())

  it('renders header component', async () => {
    render(<Header />, { wrapper: wrapper() })

    const contextBtn = await screen.findByText('All my orgs and repos')
    expect(contextBtn).toBeInTheDocument()
  })
})
