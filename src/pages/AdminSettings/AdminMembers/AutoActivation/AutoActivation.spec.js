import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { rest } from 'msw'
import { setupServer } from 'msw/node'

import AutoActivation from './AutoActivation'

const queryClient = new QueryClient()
const server = setupServer()
const mockResponse = {
  planAutoActivate: true,
  seatsUsed: 1,
  seatsAvailable: 10,
}

beforeAll(() => server.listen())
beforeEach(() => {
  queryClient.clear()
  server.resetHandlers()
})
afterAll(() => server.close())

describe('AutoActivation', () => {
  function setup() {
    server.use(
      rest.get('/internal/settings', (req, res, ctx) => {
        console.debug(mockResponse)
        res(ctx.status(200), ctx.json(mockResponse))
      }),
      rest.patch('/internal/settings', (req, res, ctx) => {
        const { plan_auto_activate } = req.body
        mockResponse.planAutoActivate = plan_auto_activate

        return res(ctx.status(200))
      })
    )

    render(
      <QueryClientProvider client={queryClient}>
        <AutoActivation autoActivate={mockResponse.planAutoActivate} />
      </QueryClientProvider>
    )
  }

  describe('it renders the component', () => {
    beforeEach(() => {
      setup({ toggleState: true })
    })

    it('displays activated toggle', async () => {
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
      let toggle = await screen.findByRole('button', { name: 'On' })

      userEvent.click(toggle)

      await waitFor(() => queryClient.isMutating)
      await waitFor(() => queryClient.isFetching)
      await waitFor(() => !queryClient.isFetching)
      await waitFor(() => !queryClient.isMutating)

      toggle = await screen.findByRole('button', { name: 'Off' })
      expect(toggle).toBeInTheDocument()
    })
  })
})
