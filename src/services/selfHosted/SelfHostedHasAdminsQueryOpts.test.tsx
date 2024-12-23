import {
  QueryClientProvider as QueryClientProviderV5,
  QueryClient as QueryClientV5,
  useQuery as useQueryV5,
} from '@tanstack/react-queryV5'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { z } from 'zod'

import {
  HasAdminsSchema,
  SelfHostedHasAdminsQueryOpts,
} from './SelfHostedHasAdminsQueryOpts'

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
  server.resetHandlers()
  queryClientV5.clear()
})

afterAll(() => {
  server.close()
})

interface SetupArgs {
  data: z.infer<typeof HasAdminsSchema>
}

describe('SelfHostedHasAdminsQueryOpts', () => {
  function setup({ data }: SetupArgs) {
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
        () => useQueryV5(SelfHostedHasAdminsQueryOpts({ provider: 'gl' })),
        { wrapper }
      )

      await waitFor(() => expect(result.current.data).toEqual(true))
    })
  })
})
