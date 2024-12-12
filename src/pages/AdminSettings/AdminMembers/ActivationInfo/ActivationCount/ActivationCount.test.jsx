import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import ActivationCount from './ActivationCount'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})

const mockResponse = {
  config: {
    planAutoActivate: true,
    seatsUsed: 5,
    seatsLimit: 10,
  },
}

const wrapper =
  () =>
  ({ children }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/gh']}>
        <Route path="/:provider">{children}</Route>
      </MemoryRouter>
    </QueryClientProvider>
  )

const server = setupServer()
beforeAll(() => {
  server.listen()
})

beforeEach(() => {
  server.resetHandlers()
  queryClient.clear()
})

afterAll(() => {
  server.close()
})

describe('ActivationCount', () => {
  function setup() {
    server.use(
      graphql.query('SelfHostedSettings', () => {
        return HttpResponse.json({ data: mockResponse })
      })
    )
  }

  describe('it renders component', () => {
    describe('seat limit is not reached', () => {
      it('displays seat count', async () => {
        setup()
        render(<ActivationCount />, { wrapper: wrapper() })

        const element = await screen.findByText('5')
        expect(element).toBeInTheDocument()
      })

      it('displays seat limit', async () => {
        setup()
        render(<ActivationCount />, { wrapper: wrapper() })

        const element = await screen.findByText('10')
        expect(element).toBeInTheDocument()
      })
    })

    describe('seat limit is reached', () => {
      it('displays info message', async () => {
        setup({ seatsLimit: 10, seatsUsed: 10 })
        render(<ActivationCount />, { wrapper: wrapper() })

        const link = await screen.findByText('sales@codecov.io')
        expect(link).toBeInTheDocument()
        expect(link).toHaveAttribute('href', 'mailto:sales@codecov.io')
      })
    })
  })
})
