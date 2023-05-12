import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook } from '@testing-library/react-hooks'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import { useComponentComparison } from './useComponentComparison'

const queryClient = new QueryClient()
const wrapper = ({ children }) => (
  <MemoryRouter
    initialEntries={['/gh/matt-mercer/exandria/pull/123/components']}
  >
    <Route path="/:provider/:owner/:repo/pull/:pullId/components">
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

const mockComponentComparisons = {
  name: 'kevdak',
  patchTotals: {
    percentCovered: 31.46,
  },
  headTotals: {
    percentCovered: 71.46,
  },
  baseTotals: {
    percentCovered: 51.46,
  },
}

const mockResponse = {
  owner: {
    repository: {
      pull: {
        compareWithBase: {
          componentComparisons: mockComponentComparisons,
        },
      },
    },
  },
}

describe('useComponentComparison', () => {
  function setup() {
    server.use(
      graphql.query('PullComponentComparison', (req, res, ctx) => {
        return res(ctx.status(200), ctx.data(mockResponse))
      })
    )
  }

  describe('when called', () => {
    beforeEach(() => {
      setup()
    })

    it('returns data for the owner page', async () => {
      const { result, waitFor } = renderHook(() => useComponentComparison({}), {
        wrapper,
      })

      await waitFor(() =>
        expect(
          result.current.data.data.owner.repository.pull.compareWithBase
            .componentComparisons
        ).toEqual(mockComponentComparisons)
      )
    })
  })
})
