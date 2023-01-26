import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import Header from './Header'

jest.mock('layouts/MyContextSwitcher', () => () => 'MyContextSwitcher')

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
})
const server = setupServer()

const wrapper = ({ children }) => (
  <QueryClientProvider ovider client={queryClient}>
    <MemoryRouter initialEntries={['plan/gh/codecov']}>
      <Route path="plan/:provider/:owner">{children}</Route>
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

const mockOwner = {
  username: 'Keyleth',
}

describe('Header', () => {
  function setup() {
    server.use(
      graphql.query('PlanPageData', (req, res, ctx) =>
        res(ctx.status(200), ctx.data({ owner: mockOwner }))
      )
    )
  }

  describe('render', () => {
    beforeEach(() => {
      setup()
    })

    it('renders the context switcher', async () => {
      render(<Header />, { wrapper })
      expect(await screen.findByText(/MyContextSwitcher/)).toBeInTheDocument()
    })
  })
})
