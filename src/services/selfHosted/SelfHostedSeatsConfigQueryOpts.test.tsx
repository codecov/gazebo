import {
  QueryClientProvider as QueryClientProviderV5,
  QueryClient as QueryClientV5,
  useQuery as useQueryV5,
} from '@tanstack/react-queryV5'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import { SelfHostedSeatsConfigQueryOpts } from './SelfHostedSeatsConfigQueryOpts'

const mockData = {
  config: {
    seatsUsed: 5,
    seatsLimit: 10,
  },
}

const queryClientV5 = new QueryClientV5({
  defaultOptions: { queries: { retry: false } },
})
const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <QueryClientProviderV5 client={queryClientV5}>
    {children}
  </QueryClientProviderV5>
)

const server = setupServer()
beforeAll(() => {
  server.listen()
})

beforeEach(() => {
  queryClientV5.clear()
  server.resetHandlers()
})

afterAll(() => {
  server.close()
})

describe('useSelfHostedSeatsConfig', () => {
  function setup() {
    server.use(
      graphql.query('Seats', () => {
        return HttpResponse.json({ data: mockData })
      })
    )
  }

  describe('when called', () => {
    it('returns data', async () => {
      setup()
      const { result } = renderHook(
        () => useQueryV5(SelfHostedSeatsConfigQueryOpts({ provider: 'gh' })),
        { wrapper }
      )

      await waitFor(() =>
        expect(result.current.data).toStrictEqual({
          seatsUsed: 5,
          seatsLimit: 10,
        })
      )
    })
  })
})
