import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'

import { useTrialData } from './useTrialData'

const mockTrialData = {
  owner: {
    plan: {
      trialStatus: 'ONGOING',
      trialStartDate: '2023-01-01T08:55:25',
      trialEndDate: '2023-01-10T08:55:25',
    },
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
  function setup({ trialData }: { trialData: any }) {
    server.use(
      graphql.query('GetTrialData', (req, res, ctx) =>
        res(ctx.status(200), ctx.data(trialData))
      )
    )
  }

  describe('calling hook', () => {
    describe('there is trial data', () => {
      beforeEach(() => setup({ trialData: mockTrialData }))

      it('returns the trial data', async () => {
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
            plan: {
              trialStatus: 'ONGOING',
              trialStartDate: '2023-01-01T08:55:25',
              trialEndDate: '2023-01-10T08:55:25',
            },
          })
        )
      })
    })

    describe('there is no trial data', () => {
      beforeEach(() => setup({ trialData: undefined }))

      it('returns an empty object', async () => {
        const { result } = renderHook(
          () =>
            useTrialData({
              provider: 'gh',
              owner: 'codecov',
            }),
          { wrapper }
        )

        await waitFor(() => expect(result.current.data).toStrictEqual({}))
      })
    })
  })
})
