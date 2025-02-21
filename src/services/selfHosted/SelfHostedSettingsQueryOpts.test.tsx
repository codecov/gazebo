import {
  QueryClientProvider as QueryClientProviderV5,
  QueryClient as QueryClientV5,
  useQuery as useQueryV5,
} from '@tanstack/react-queryV5'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { type MockInstance } from 'vitest'

import { SelfHostedSettingsQueryOpts } from './SelfHostedSettingsQueryOpts'

const queryClientV5 = new QueryClientV5({
  defaultOptions: { queries: { retry: false } },
})

const mockResponse = {
  config: {
    planAutoActivate: true,
    seatsUsed: 1,
    seatsLimit: 10,
  },
}

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

describe('useSelfHostedSettings', () => {
  function setup({ invalidResponse = false }) {
    server.use(
      graphql.query('SelfHostedSettings', () => {
        if (invalidResponse) {
          return HttpResponse.json({})
        }
        return HttpResponse.json({ data: mockResponse })
      })
    )
  }

  describe('when called', () => {
    it('returns data', async () => {
      setup({})
      const { result } = renderHook(
        () => useQueryV5(SelfHostedSettingsQueryOpts({ provider: 'github' })),
        { wrapper }
      )

      await waitFor(() =>
        expect(result.current.data).toStrictEqual({
          planAutoActivate: true,
          seatsUsed: 1,
          seatsLimit: 10,
        })
      )
    })
  })

  describe('invalid response', () => {
    let consoleSpy: MockInstance

    beforeAll(() => {
      consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    })

    afterAll(() => {
      consoleSpy.mockRestore()
    })

    it('rejects with 404', async () => {
      setup({ invalidResponse: true })
      const { result } = renderHook(
        () => useQueryV5(SelfHostedSettingsQueryOpts({ provider: 'github' })),
        { wrapper }
      )

      await waitFor(() =>
        expect(result.current.error).toEqual(
          expect.objectContaining({
            dev: 'SelfHostedSettingsQueryOpts - Parsing Error',
            status: 400,
          })
        )
      )
    })
  })
})
