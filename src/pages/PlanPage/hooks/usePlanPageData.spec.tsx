import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { ReactNode } from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

import { usePlanPageData } from './usePlanPageData'

const mockOwner = {
  username: 'TerrySmithDC',
  isCurrentUserPartOfOrg: true,
  numberOfUploads: 30,
}

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})
const wrapper = ({ children }: { children: ReactNode }) => (
  <MemoryRouter initialEntries={['/gh']}>
    <Route path="/:provider">
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </Route>
  </MemoryRouter>
)

const server = setupServer()

beforeAll(() => server.listen())
beforeEach(() => {
  server.resetHandlers()
  queryClient.clear()
})
afterAll(() => server.close())

describe('usePlanPageData', () => {
  function setup() {
    server.use(
      graphql.query('PlanPageData', (req, res, ctx) => {
        return res(
          ctx.status(200),
          ctx.data({
            owner: mockOwner,
          })
        )
      })
    )
  }

  describe('when called', () => {
    beforeEach(() => {
      setup()
    })

    it('returns data for the owner page', async () => {
      const { result } = renderHook(() => usePlanPageData(), { wrapper })

      await waitFor(() => result.current.isLoading)
      await waitFor(() => !result.current.isLoading)

      await waitFor(() => expect(result.current.data).toEqual(mockOwner))
    })
  })
})
