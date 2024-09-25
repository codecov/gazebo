import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw2'
import { setupServer } from 'msw2/node'
import { MemoryRouter, Route } from 'react-router-dom'

import SeatDetails from './SeatDetails'

const mockData = {
  config: {
    seatsUsed: 5,
    seatsLimit: 10,
  },
}

const mockUndefinedSeats = {
  config: {},
}

const wrapper: ({
  initialEntries,
}: {
  initialEntries?: string
}) => React.FC<React.PropsWithChildren> =
  ({ initialEntries = '/gh' }) =>
  ({ children }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialEntries]}>
        <Route path="/:provider" exact>
          {children}
        </Route>
      </MemoryRouter>
    </QueryClientProvider>
  )

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})

const server = setupServer()
beforeAll(() => {
  server.listen()
})

afterEach(() => {
  server.resetHandlers()
  queryClient.clear()
})

afterAll(() => {
  server.close()
})

describe('SeatDetails', () => {
  function setup({ data = mockData }: { data?: any }) {
    server.use(
      graphql.query('Seats', (info) => {
        return HttpResponse.json({ data })
      })
    )
  }

  describe('renders component', () => {
    describe('values are defined', () => {
      beforeEach(() => {
        setup({})
      })

      it('displays the number of active seats', async () => {
        render(<SeatDetails />, { wrapper: wrapper({}) })
        const number = await screen.findByText('5')
        expect(number).toBeInTheDocument()

        const text = await screen.findByText(/active users/)
        expect(text).toBeInTheDocument()
      })

      it('displays the number of total seats', async () => {
        render(<SeatDetails />, { wrapper: wrapper({}) })

        const number = await screen.findByText('10')
        expect(number).toBeInTheDocument()

        const text = await screen.findByText(/available seats/)
        expect(text).toBeInTheDocument()
      })
    })

    describe('when values are undefined', () => {
      it('renders error message', async () => {
        setup({ data: mockUndefinedSeats })
        render(<SeatDetails />, { wrapper: wrapper({}) })

        const message = await screen.findByText(
          'Unable to get seat usage information'
        )
        expect(message).toBeInTheDocument()
      })
    })
  })
})
