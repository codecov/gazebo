import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  QueryClientProvider as QueryClientProviderV5,
  QueryClient as QueryClientV5,
  useQuery as useQueryV5,
} from '@tanstack/react-queryV5'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import { TokenlessQueryOpts } from './TokenlessQueryOpts'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})
const queryClientV5 = new QueryClientV5({
  defaultOptions: { queries: { retry: false } },
})

const wrapper =
  (initialEntries = '/gh'): React.FC<React.PropsWithChildren> =>
  ({ children }) => (
    <QueryClientProviderV5 client={queryClientV5}>
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[initialEntries]}>
          <Route path="/:provider">{children}</Route>
        </MemoryRouter>
      </QueryClientProvider>
      ``
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

const mockCodecovOrg = {
  hasActiveRepos: true,
  hasPublicRepos: true,
}

describe('TokenlessQueryOpts', () => {
  function setup() {
    server.use(
      graphql.query('OwnerTokenlessData', () => {
        return HttpResponse.json({ data: { owner: mockCodecovOrg } })
      })
    )
  }

  describe('when called and user is authenticated', () => {
    it('returns the org', async () => {
      setup()
      const { result } = renderHook(
        () =>
          useQueryV5(
            TokenlessQueryOpts({ username: 'codecov', provider: 'gh' })
          ),
        { wrapper: wrapper() }
      )

      await waitFor(() => expect(result.current.data).toEqual(mockCodecovOrg))
    })
  })
})
