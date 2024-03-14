import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
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
const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
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
  function setup({ invalidSchema = false }) {
    server.use(
      graphql.query('PlanPageData', (req, res, ctx) => {
        if (invalidSchema) {
          return res(ctx.status(200), ctx.data({}))
        }
        return res(ctx.status(200), ctx.data({ owner: mockOwner }))
      })
    )
  }

  describe('when called', () => {
    beforeEach(() => {
      setup({})
    })

    it('returns data for the owner page', async () => {
      const { result } = renderHook(
        () =>
          usePlanPageData({
            owner: 'popcorn',
            provider: 'gh',
          }),
        { wrapper }
      )

      await waitFor(() => result.current.isLoading)
      await waitFor(() => !result.current.isLoading)

      await waitFor(() => expect(result.current.data).toEqual(mockOwner))
    })
  })

  describe('when schema parsing fails', () => {
    it('rejects with status 404', async () => {
      setup({ invalidSchema: true })
      const { result } = renderHook(
        () =>
          usePlanPageData({
            owner: 'popcorn',
            provider: 'gh',
          }),
        { wrapper }
      )

      await waitFor(() => result.current.isLoading)
      await waitFor(() => !result.current.isLoading)

      await waitFor(() =>
        expect(result.current.error).toEqual(
          expect.objectContaining({
            status: 404,
            dev: 'usePlanPageData - 404 schema parsing failed',
          })
        )
      )
    })
  })
})
