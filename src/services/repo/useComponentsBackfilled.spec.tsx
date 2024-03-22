import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import { useComponentsBackfilled } from './index'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})

const wrapper =
  (
    initialEntries = '/gh/test-org/test-repo'
  ): React.FC<React.PropsWithChildren> =>
  ({ children }) =>
    (
      <MemoryRouter initialEntries={[initialEntries]}>
        <Route path="/:provider/:owner/:repo">
          <QueryClientProvider client={queryClient}>
            {children}
          </QueryClientProvider>
        </Route>
      </MemoryRouter>
    )

const server = setupServer()

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

const dataReturned = {
  owner: {
    repository: {
      componentsMeasurementsActive: true,
      componentsMeasurementsBackfilled: true,
    },
  },
}

describe('useComponentsBackfilled', () => {
  function setup({ isSchemaValid = true } = {}) {
    server.use(
      graphql.query('BackfillComponentMemberships', (req, res, ctx) => {
        if (!isSchemaValid) {
          return res(ctx.status(200), ctx.data({}))
        }
        return res(ctx.status(200), ctx.data(dataReturned))
      })
    )
  }

  describe('when called', () => {
    beforeEach(() => {
      setup()
    })

    describe('when response is a valid schema', () => {
      it('returns the data', async () => {
        const { result } = renderHook(() => useComponentsBackfilled(), {
          wrapper: wrapper(),
        })

        const expectedResponse = {
          componentsMeasurementsActive: true,
          componentsMeasurementsBackfilled: true,
        }
        await waitFor(() =>
          expect(result.current.data).toEqual(expectedResponse)
        )
      })
    })
  })

  describe('when the schema is invalid', () => {
    beforeEach(() => {
      setup({ isSchemaValid: false })
    })

    it('returns an error', async () => {
      const { result } = renderHook(() => useComponentsBackfilled(), {
        wrapper: wrapper(),
      })

      await waitFor(() =>
        expect(result.current.error).toEqual({
          status: 404,
          data: {},
          dev: 'useComponentsBackfilled - 404 Not Found Error',
        })
      )
    })
  })
})
