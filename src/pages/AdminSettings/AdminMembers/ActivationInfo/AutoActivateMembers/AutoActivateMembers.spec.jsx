import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { rest } from 'msw'
import { setupServer } from 'msw/node'

import AutoActivateMembers from './AutoActivateMembers'

const queryClient = new QueryClient()
const server = setupServer()
const mockResponse = {
  planAutoActivate: true,
  seatsUsed: 1,
  seatsAvailable: 10,
}

beforeAll(() => server.listen())
afterEach(() => {
  queryClient.clear()
  server.resetHandlers()
})
afterAll(() => server.close())

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

    render(
      <QueryClientProvider client={queryClient}>
        <AutoActivateMembers autoActivate={mockResponse.planAutoActivate} />
      </QueryClientProvider>
    )
  }

  describe('it renders the component', () => {
    beforeEach(async () => {
      setup()

      await waitFor(() => queryClient.isFetching)
      await waitFor(() => !queryClient.isFetching)
    })

    it('displays activated toggle', async () => {
      const toggle = await screen.findByRole('button', {
        name: 'On',
      })

      expect(toggle).toBeInTheDocument()
    })
  })

  describe('user clicks on toggle', () => {
    beforeEach(async () => {
      setup()

      await waitFor(() => queryClient.isFetching)
      await waitFor(() => !queryClient.isFetching)
    })

    it('changes to off', async () => {
      let toggle = await screen.findByRole('button', { name: 'On' })

      userEvent.click(toggle)

      await waitFor(() => queryClient.isFetching)
      await waitFor(() => !queryClient.isFetching)

      toggle = await screen.findByRole('button', { name: 'Off' })
      expect(toggle).toBeInTheDocument()
    })
  })
})
