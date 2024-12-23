import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  QueryClientProvider as QueryClientProviderV5,
  QueryClient as QueryClientV5,
} from '@tanstack/react-queryV5'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { Suspense } from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

import AutoActivateMembers from './AutoActivateMembers'

const mockResponse = {
  config: { planAutoActivate: true, seatsUsed: 1, seatsLimit: 10 },
}

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})
const queryClientV5 = new QueryClientV5({
  defaultOptions: { queries: { retry: false } },
})

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <QueryClientProviderV5 client={queryClientV5}>
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/gh']}>
        <Route path="/:provider">
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
  server.resetHandlers()
})

afterAll(() => {
  server.close()
})

describe('AutoActivateMembers', () => {
  function setup() {
    const user = userEvent.setup()
    server.use(
      graphql.query('SelfHostedSettings', () => {
        return HttpResponse.json({ data: mockResponse })
      }),

      graphql.mutation('UpdateSelfHostedSettings', (info) => {
        mockResponse.config.planAutoActivate = info.variables.shouldAutoActivate
        return HttpResponse.json({ data: {} })
      })
    )
    return { user }
  }

  describe('it renders the component', () => {
    it('displays activated toggle', async () => {
      setup()
      render(<AutoActivateMembers />, { wrapper })

      const toggle = await screen.findByRole('button', {
        name: 'On',
      })
      expect(toggle).toBeInTheDocument()
    })
  })

  describe('user clicks on toggle', () => {
    it('changes to off', async () => {
      const { user } = setup()
      render(<AutoActivateMembers />, { wrapper })

      let toggle = await screen.findByRole('button', { name: 'On' })

      await user.click(toggle)

      toggle = await screen.findByRole('button', { name: 'Off' })
      expect(toggle).toBeInTheDocument()
    })
  })
})
