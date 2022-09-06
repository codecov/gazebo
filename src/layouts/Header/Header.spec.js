import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import { useUser } from 'services/user'

import Header from './Header'

jest.mock('services/user')

const loggedInUser = {
  user: {
    username: 'p',
    avatarUrl: '',
  },
}

const mockSeatData = {
  config: {
    seatsUsed: 5,
    seatsLimit: 10,
  },
}

const queryClient = new QueryClient()
const server = setupServer()

beforeAll(() => server.listen())
beforeEach(() => {
  server.resetHandlers()
  queryClient.clear()
})
afterAll(() => server.close())

describe('Header', () => {
  function setup({ provider }) {
    useUser.mockReturnValue({ data: loggedInUser })

    server.use(
      server.use(
        graphql.query('Seats', (req, res, ctx) =>
          res(ctx.status(200), ctx.data(mockSeatData))
        )
      )
    )

    render(
      <MemoryRouter initialEntries={[`/${provider}`]}>
        <Route path="/:provider" exact>
          <QueryClientProvider client={queryClient}>
            <Header />
          </QueryClientProvider>
        </Route>
      </MemoryRouter>
    )
  }

  it('renders the DesktopMenu', () => {
    setup({ provider: 'gh' })
    const menu = screen.getByTestId('desktop-menu')
    expect(menu).toBeInTheDocument()
  })
})
