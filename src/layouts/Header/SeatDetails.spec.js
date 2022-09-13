import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'

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

const queryClient = new QueryClient()

const server = new setupServer()
beforeAll(() => server.listen())
beforeEach(() => {
  server.resetHandlers()
  queryClient.clear()
})
afterAll(() => server.close())

describe('SeatDetails', () => {
  let renderData

  function setup({ data = mockData }) {
    server.use(
      graphql.query('Seats', (req, res, ctx) =>
        res(ctx.status(200), ctx.data(data))
      )
    )

    renderData = render(
      <QueryClientProvider client={queryClient}>
        <SeatDetails />
      </QueryClientProvider>
    )
  }

  describe('renders component', () => {
    describe('values are defined', () => {
      beforeEach(() => {
        setup({})
      })

      it('displays the number of active seats', async () => {
        const number = await screen.findByText('5')
        expect(number).toBeInTheDocument()

        const text = await screen.findByText(/active users/)
        expect(text).toBeInTheDocument()
      })

      it('displays the number of total seats', async () => {
        const number = await screen.findByText('10')
        expect(number).toBeInTheDocument()

        const text = await screen.findByText(/available seats/)
        expect(text).toBeInTheDocument()
      })
    })

    describe('values are undefined', () => {
      beforeEach(() => {
        setup({ data: mockUndefinedSeats })
      })

      it('renders nothing', () => {
        expect(renderData.container).toBeEmptyDOMElement()
      })
    })
  })
})
