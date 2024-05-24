import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import ActivationCount from './ActivationCount'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})
const server = setupServer()

const mockResponse = {
  owner: {
    repository: {
      __typename: 'Repository',
      planAutoActivate: true,
      seatsUsed: 5,
      seatsLimit: 10,
    },
  },
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
      graphql.query('SelfHostedSettings', (req, res, ctx) => {
        return res(ctx.status(200), ctx.data(mockResponse))
      })
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

        const link = await screen.findByText('sales@codecov.io')

        expect(link).toBeInTheDocument()
        expect(link).toHaveAttribute('href', 'mailto:sales@codecov.io')
      })
    })
  })
})
