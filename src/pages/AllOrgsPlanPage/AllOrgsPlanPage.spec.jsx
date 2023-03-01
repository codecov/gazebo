import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import AllOrgsPlanPage from './AllOrgsPlanPage'

jest.mock('./UpgradePlan', () => () => 'UpgradePlan')
jest.mock('config')

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

describe('AllOrgsPlanPage', () => {
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
    render(<AllOrgsPlanPage />, { wrapper: wrapper() })

    const contextBtn = await screen.findByText('All my orgs and repos')
    expect(contextBtn).toBeInTheDocument()
  })

  describe('renders tabs', () => {
    it('renders repos tab', async () => {
      render(<AllOrgsPlanPage />, { wrapper: wrapper() })

      const repos = await screen.findByRole('link', { name: 'Repos' })
      expect(repos).toBeInTheDocument()
      expect(repos).not.toHaveAttribute('aria-current', 'page')
    })

    it('renders plan tab', async () => {
      render(<AllOrgsPlanPage />, { wrapper: wrapper() })

      const plan = await screen.findByRole('link', { name: 'Plan' })
      expect(plan).toBeInTheDocument()
      expect(plan).toHaveAttribute('aria-current', 'page')
    })
  })

  it('renders the upgrade plan component', async () => {
    render(<AllOrgsPlanPage />, { wrapper: wrapper() })

    const upgradePlan = await screen.findByText(/UpgradePlan/)
    expect(upgradePlan).toBeInTheDocument()
  })
})
