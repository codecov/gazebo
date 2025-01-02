import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  QueryClientProvider as QueryClientProviderV5,
  QueryClient as QueryClientV5,
} from '@tanstack/react-queryV5'
import { render, screen } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { Suspense } from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

import SeatDetails from './SeatDetails'

const mockData = {
  config: {
    seatsUsed: 5,
    seatsLimit: 10,
  },
}

const mockUndefinedSeats = {
  config: null,
}

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})
const queryClientV5 = new QueryClientV5({
  defaultOptions: { queries: { retry: false } },
})

const wrapper: ({
  initialEntries,
}: {
  initialEntries?: string
}) => React.FC<React.PropsWithChildren> =
  ({ initialEntries = '/gh' }) =>
  ({ children }) => (
    <QueryClientProviderV5 client={queryClientV5}>
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[initialEntries]}>
          <Route path="/:provider" exact>
            <Suspense fallback={<div>Loading</div>}>{children}</Suspense>
          </Route>
        </MemoryRouter>
      </QueryClientProvider>
    </QueryClientProviderV5>
  )

const server = setupServer()
beforeAll(() => {
  server.listen()
})

afterEach(() => {
  queryClient.clear()
  queryClientV5.clear()
  server.resetHandlers()
})

afterAll(() => {
  server.close()
})

describe('SeatDetails', () => {
  function setup({ data = mockData }: { data?: any }) {
    server.use(
      graphql.query('Seats', () => {
        return HttpResponse.json({ data })
      })
    )
  }

  describe('renders component', () => {
    describe('values are defined', () => {
      it('displays the number of active seats', async () => {
        setup({})
        render(<SeatDetails />, { wrapper: wrapper({}) })

        const number = await screen.findByText('5')
        expect(number).toBeInTheDocument()

        const text = await screen.findByText(/active users/)
        expect(text).toBeInTheDocument()
      })

      it('displays the number of total seats', async () => {
        setup({})
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
