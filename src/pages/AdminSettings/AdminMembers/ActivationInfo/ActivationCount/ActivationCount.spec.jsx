import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import ActivationCount from './ActivationCount'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})
const server = setupServer()
const mockResponse = {
  planAutoActivate: true,
  seatsUsed: 5,
  seatsLimit: 10,
}

const wrapper =
  () =>
  ({ children }) =>
    (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/gh']}>
          <Route path="/:provider">{children}</Route>
        </MemoryRouter>
      </QueryClientProvider>
    )

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
  }

  describe('it renders component', () => {
    describe('seat limit is not reached', () => {
      beforeEach(async () => {
        setup()
      })

      it('displays seat count', async () => {
        render(<ActivationCount />, { wrapper: wrapper() })

        const element = await screen.findByText('5')
        expect(element).toBeInTheDocument()
      })

      it('displays seat limit', async () => {
        render(<ActivationCount />, { wrapper: wrapper() })

        const element = await screen.findByText('10')
        expect(element).toBeInTheDocument()
      })
    })

    describe('seat limit is reached', () => {
      beforeEach(async () => {
        setup({ seatsLimit: 10, seatsUsed: 10 })
      })

      it('displays info message', async () => {
        render(<ActivationCount />, { wrapper: wrapper() })

        const link = await screen.findByText('success@codecov.io')

        expect(link).toBeInTheDocument()
        expect(link).toHaveAttribute('href', 'mailto:success@codecov.io')
      })
    })
  })
})
