import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import AutoActivateMembers from './AutoActivateMembers'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})
const server = setupServer()
const mockResponse = {
  planAutoActivate: true,
  seatsUsed: 1,
  seatsLimit: 10,
}

beforeAll(() => server.listen())
afterEach(() => {
  queryClient.clear()
  server.resetHandlers()
})
afterAll(() => server.close())

const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter initialEntries={['/gh']}>
      <Route path="/:provider">{children}</Route>
    </MemoryRouter>
  </QueryClientProvider>
)

describe('AutoActivateMembers', () => {
  function setup() {
    server.use(
      rest.get('/internal/settings', (req, res, ctx) =>
        res(ctx.status(200), ctx.json(mockResponse))
      ),
      rest.patch('/internal/settings', (req, res, ctx) => {
        const { plan_auto_activate } = req.body

        mockResponse.planAutoActivate = plan_auto_activate

        return res(ctx.status(200), ctx.json({}))
      })
    )
  }

  describe('it renders the component', () => {
    beforeEach(async () => setup())

    it('displays activated toggle', async () => {
      render(
        <AutoActivateMembers autoActivate={mockResponse.planAutoActivate} />,
        { wrapper }
      )

      await waitFor(() => queryClient.isFetching)
      await waitFor(() => !queryClient.isFetching)

      const toggle = await screen.findByRole('button', {
        name: 'On',
      })

      expect(toggle).toBeInTheDocument()
    })
  })

  describe('user clicks on toggle', () => {
    beforeEach(() => {
      setup()
    })

    it('changes to off', async () => {
      const user = userEvent.setup()
      render(
        <AutoActivateMembers autoActivate={mockResponse.planAutoActivate} />,
        { wrapper }
      )

      await waitFor(() => queryClient.isFetching)
      await waitFor(() => !queryClient.isFetching)

      let toggle = await screen.findByRole('button', { name: 'On' })

      await user.click(toggle)

      await waitFor(() => queryClient.isFetching)
      await waitFor(() => !queryClient.isFetching)

      toggle = await screen.findByRole('button', { name: 'Off' })
      expect(toggle).toBeInTheDocument()
    })
  })
})
