import {
  QueryClientProvider as QueryClientProviderV5,
  QueryClient as QueryClientV5,
  useQuery as useQueryV5,
} from '@tanstack/react-queryV5'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'
import { type MockInstance } from 'vitest'

import { PlanPageDataQueryOpts } from './PlanPageDataQueryOpts'

const mockOwner = {
  username: 'cool-user',
  isCurrentUserPartOfOrg: true,
  numberOfUploads: 30,
}

const queryClientV5 = new QueryClientV5({
  defaultOptions: { queries: { retry: false } },
})
const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <MemoryRouter initialEntries={['/gh']}>
    <Route path="/:provider">
      <QueryClientProviderV5 client={queryClientV5}>
        {children}
      </QueryClientProviderV5>
    </Route>
  </MemoryRouter>
)

const server = setupServer()

beforeAll(() => {
  server.listen()
})

beforeEach(() => {
  server.resetHandlers()
  queryClientV5.clear()
})

afterAll(() => {
  server.close()
})

describe('usePlanPageData', () => {
  function setup({ invalidSchema = false }) {
    server.use(
      graphql.query('PlanPageData', () => {
        if (invalidSchema) {
          return HttpResponse.json({ data: {} })
        }
        return HttpResponse.json({ data: { owner: mockOwner } })
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
          useQueryV5(
            PlanPageDataQueryOpts({
              owner: 'popcorn',
              provider: 'gh',
            })
          ),
        { wrapper }
      )

      await waitFor(() => result.current.isLoading)
      await waitFor(() => !result.current.isLoading)

      await waitFor(() => expect(result.current.data).toEqual(mockOwner))
    })
  })

  describe('when schema parsing fails', () => {
    let consoleSpy: MockInstance
    beforeAll(() => {
      consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    })

    afterAll(() => {
      consoleSpy.mockRestore()
    })

    it('rejects with status 404', async () => {
      setup({ invalidSchema: true })
      const { result } = renderHook(
        () =>
          useQueryV5(
            PlanPageDataQueryOpts({
              owner: 'popcorn',
              provider: 'gh',
            })
          ),
        { wrapper }
      )

      await waitFor(() => result.current.isLoading)
      await waitFor(() => !result.current.isLoading)

      await waitFor(() =>
        expect(result.current.error).toEqual(
          expect.objectContaining({
            dev: 'PlanPageDataQueryOpts - Parsing Error',
            status: 400,
          })
        )
      )
    })
  })
})
