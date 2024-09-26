import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { graphql, HttpResponse } from 'msw2'
import { setupServer } from 'msw2/node'
import { MemoryRouter, Route } from 'react-router-dom'

import AutoActivateMembers from './AutoActivateMembers'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})

const mockResponse = {
  config: {
    planAutoActivate: true,
    seatsUsed: 1,
    seatsLimit: 10,
  },
}

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

const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter initialEntries={['/gh']}>
      <Route path="/:provider">{children}</Route>
    </MemoryRouter>
  </QueryClientProvider>
)

describe('AutoActivateMembers', () => {
  function setup() {
    const user = userEvent.setup()
    server.use(
      graphql.query('SelfHostedSettings', (info) => {
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
      render(
        <AutoActivateMembers autoActivate={mockResponse.planAutoActivate} />,
        { wrapper }
      )

      const toggle = await screen.findByRole('button', {
        name: 'On',
      })
      expect(toggle).toBeInTheDocument()
    })
  })

  describe('user clicks on toggle', () => {
    it('changes to off', async () => {
      const { user } = setup()
      render(
        <AutoActivateMembers autoActivate={mockResponse.planAutoActivate} />,
        { wrapper }
      )

      let toggle = await screen.findByRole('button', { name: 'On' })

      await user.click(toggle)

      toggle = await screen.findByRole('button', { name: 'Off' })
      expect(toggle).toBeInTheDocument()
    })
  })
})
