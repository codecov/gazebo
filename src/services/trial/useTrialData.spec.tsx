import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'

import { useTrialData } from './useTrialData'

const mockTrialData = {
  owner: {
    trialStatus: 'ONGOING',
  },
}

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})
const server = setupServer()

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
)

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

describe('useTrialData', () => {
  function setup() {
    server.use(
      graphql.query('GetTrialData', (req, res, ctx) =>
        res(ctx.status(200), ctx.data(mockTrialData))
      )
    )
  }

  describe('calling hook', () => {
    beforeEach(() => setup())

    it('fetches the branch data', async () => {
      const { result } = renderHook(
        () =>
          useTrialData({
            provider: 'gh',
            owner: 'codecov',
          }),
        { wrapper }
      )

      await waitFor(() =>
        expect(result.current.data).toStrictEqual({
          trialStatus: 'ONGOING',
        })
      )
    })
  })
})
