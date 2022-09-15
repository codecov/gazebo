import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import { rest } from 'msw'
import { setupServer } from 'msw/node'

import ActivationCount from './ActivationCount'

const queryClient = new QueryClient()
const server = setupServer()
const mockResponse = {
  planAutoActivate: true,
  seatsUsed: 5,
  seatsLimit: 10,
}

beforeAll(() => server.listen())
beforeEach(() => {
  server.resetHandlers()
  queryClient.clear()
})
afterAll(() => server.close())

describe('ActivationCount', () => {
  function setup() {
    server.use(
      rest.get('/internal/settings', (req, res, ctx) =>
        res(ctx.status(200), ctx.json(mockResponse))
      )
    )
    render(
      <QueryClientProvider client={queryClient}>
        <ActivationCount />
      </QueryClientProvider>
    )
  }

  describe('it renders component', () => {
    describe('seat limit is not reached', () => {
      beforeEach(async () => {
        setup()

        await waitFor(() => queryClient.isFetching)
        await waitFor(() => !queryClient.isFetching)
      })
      it('displays seat count', async () => {
        const element = await screen.findByText('5')
        expect(element).toBeInTheDocument()
      })

      it('displays seat limit', async () => {
        const element = await screen.findByText('10')
        expect(element).toBeInTheDocument()
      })
    })

    describe('seat limit is reached', () => {
      beforeEach(async () => {
        setup({ seatsLimit: 10, seatsUsed: 10 })

        await waitFor(() => queryClient.isFetching)
        await waitFor(() => !queryClient.isFetching)
      })

      it('displays info message', async () => {
        const link = await screen.findByText('success@codecov.io')

        expect(link).toBeInTheDocument()
        expect(link).toHaveAttribute('href', 'mailto:success@codecov.io')
      })
    })
  })
})
