import {
  QueryClientProvider as QueryClientProviderV5,
  QueryClient as QueryClientV5,
} from '@tanstack/react-queryV5'
import { render, screen } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { Suspense } from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

import ActivationCount from './ActivationCount'

const queryClientV5 = new QueryClientV5({
  defaultOptions: { queries: { retry: false } },
})

const mockResponse = ({
  seatsUsed,
  seatsLimit,
}: {
  seatsUsed: number
  seatsLimit: number
}) => ({
  config: {
    planAutoActivate: true,
    seatsUsed,
    seatsLimit,
  },
})

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <QueryClientProviderV5 client={queryClientV5}>
    <MemoryRouter initialEntries={['/gh']}>
      <Route path="/:provider">
        <Suspense fallback={<div>Loading</div>}>{children}</Suspense>
      </Route>
    </MemoryRouter>
  </QueryClientProviderV5>
)

const server = setupServer()
beforeAll(() => {
  server.listen()
})

beforeEach(() => {
  queryClientV5.clear()
  server.resetHandlers()
})

afterAll(() => {
  server.close()
})

interface SetupArgs {
  seatsLimit: number
  seatsUsed: number
}

describe('ActivationCount', () => {
  function setup({ seatsLimit, seatsUsed }: SetupArgs) {
    server.use(
      graphql.query('SelfHostedSettings', () => {
        return HttpResponse.json({
          data: mockResponse({ seatsLimit, seatsUsed }),
        })
      })
    )
  }

  describe('it renders component', () => {
    describe('seat limit is not reached', () => {
      it('displays seat count', async () => {
        setup({ seatsLimit: 10, seatsUsed: 5 })
        render(<ActivationCount />, { wrapper })

        const element = await screen.findByText('5')
        expect(element).toBeInTheDocument()
      })

      it('displays seat limit', async () => {
        setup({ seatsLimit: 10, seatsUsed: 5 })
        render(<ActivationCount />, { wrapper })

        const element = await screen.findByText('10')
        expect(element).toBeInTheDocument()
      })
    })

    describe('seat limit is reached', () => {
      it('displays info message', async () => {
        setup({ seatsLimit: 10, seatsUsed: 10 })
        render(<ActivationCount />, { wrapper })

        const link = await screen.findByText('sales@codecov.io')
        expect(link).toBeInTheDocument()
        expect(link).toHaveAttribute('href', 'mailto:sales@codecov.io')
      })
    })
  })
})
