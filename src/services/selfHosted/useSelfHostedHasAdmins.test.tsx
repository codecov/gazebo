import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { PropsWithChildren } from 'react'
import { z } from 'zod'

import {
  HasAdminsSchema,
  useSelfHostedHasAdmins,
} from './useSelfHostedHasAdmins'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})
const wrapper: React.FC<PropsWithChildren> = ({ children }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
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

describe('useSelfHostedHasAdmins', () => {
  function setup({ data }: { data: z.infer<typeof HasAdminsSchema> }) {
    server.use(
      graphql.query('HasAdmins', () => {
        return HttpResponse.json({ data })
      })
    )
  }
  describe('when called', () => {
    it('returns the user info', async () => {
      setup({ data: { config: { hasAdmins: true } } })
      const { result } = renderHook(
        () => useSelfHostedHasAdmins({ provider: 'gl' }),
        { wrapper }
      )
      await waitFor(() => expect(result.current.data).toEqual(true))
    })
  })
})
