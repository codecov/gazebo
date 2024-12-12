import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'
import { type MockInstance } from 'vitest'

import { useSelfHostedSettings } from './useSelfHostedSettings'

const queryClient = new QueryClient({
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
  <QueryClientProvider client={queryClient}>
    <MemoryRouter initialEntries={['/gh/codecov/gazebo']}>
      <Route path="/:provider/:owner/:repo">{children}</Route>
    </MemoryRouter>
  </QueryClientProvider>
)

const server = setupServer()
beforeAll(() => {
  server.listen()
})

beforeEach(() => {
  server.resetHandlers()
  queryClient.clear()
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
      const { result } = renderHook(() => useSelfHostedSettings(), { wrapper })

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
      const { result } = renderHook(() => useSelfHostedSettings(), {
        wrapper,
      })

      await waitFor(() =>
        expect(result.current.error).toEqual(
          expect.objectContaining({
            status: 404,
            dev: 'useSelfHostedSettings - 404 schema parsing failed',
          })
        )
      )
    })
  })
})
