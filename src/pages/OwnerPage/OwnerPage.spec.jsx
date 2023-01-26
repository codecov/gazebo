import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import OwnerPage from './OwnerPage'

jest.mock('./Header', () => () => 'Header')
jest.mock('./Tabs', () => () => 'Tabs')
jest.mock('shared/ListRepo', () => () => 'ListRepo')

const queryClient = new QueryClient()
const server = setupServer()

const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter initialEntries={['/gh/codecov']}>
      <Route path="/:provider/:owner">{children}</Route>
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

describe('OwnerPage', () => {
  function setup(owner) {
    server.use(
      graphql.query('OwnerPageData', (req, res, ctx) =>
        res(ctx.status(200), ctx.data({ owner }))
      )
    )
  }

  describe('when the owner exists', () => {
    beforeEach(() => {
      setup({
        username: 'codecov',
        isCurrentUserPartOfOrg: true,
      })
    })

    it('renders the header', async () => {
      render(<OwnerPage />, { wrapper })
      const header = await screen.findByText(/Header/)
      expect(header).toBeInTheDocument()
    })

    it('renders the tabs', async () => {
      render(<OwnerPage />, { wrapper })
      const tabs = await screen.findByText(/Tabs/)
      expect(tabs).toBeInTheDocument()
    })

    it('renders the ListRepo', async () => {
      render(<OwnerPage />, { wrapper })
      const listRepo = await screen.findByText(/ListRepo/)
      expect(listRepo).toBeInTheDocument()
    })
  })

  describe('when the owner doesnt exist', () => {
    beforeEach(() => {
      setup(null)
    })

    it('doesnt render the header', () => {
      render(<OwnerPage />, { wrapper })
      expect(screen.queryByText(/Header/)).not.toBeInTheDocument()
    })

    it('doesnt renders the tabs', () => {
      render(<OwnerPage />, { wrapper })
      expect(screen.queryByText(/Tabs/)).not.toBeInTheDocument()
    })

    it('doesnt render the ListRepo', () => {
      render(<OwnerPage />, { wrapper })
      expect(screen.queryByText(/ListRepo/)).not.toBeInTheDocument()
    })
  })

  describe('when user is not part of the org', () => {
    beforeEach(() => {
      setup({
        username: 'codecov',
        isCurrentUserPartOfOrg: false,
      })
    })

    it('doesnt render links to the settings', () => {
      render(<OwnerPage />, { wrapper })
      expect(screen.queryByText(/Tabs/)).not.toBeInTheDocument()
    })
  })
})
