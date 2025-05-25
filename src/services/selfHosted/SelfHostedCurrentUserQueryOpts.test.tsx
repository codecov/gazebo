import {
  QueryClientProvider as QueryClientProviderV5,
  QueryClient as QueryClientV5,
  useQuery as useQueryV5,
} from '@tanstack/react-queryV5'
import { renderHook, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { PropsWithChildren } from 'react'

import { SelfHostedCurrentUserQueryOpts } from './SelfHostedCurrentUserQueryOpts'

const user = {
  activated: false,
  email: 'codecov@codecov.io',
  isAdmin: true,
  name: 'Codecov',
  ownerid: 2,
  username: 'codecov',
}

const queryClientV5 = new QueryClientV5({
  defaultOptions: { queries: { retry: false } },
})
const wrapper: React.FC<PropsWithChildren> = ({ children }) => (
  <QueryClientProviderV5 client={queryClientV5}>
    {children}
  </QueryClientProviderV5>
)

const server = setupServer()
beforeAll(() => {
  server.listen()
})

afterEach(() => {
  queryClientV5.clear()
  server.resetHandlers()
})

afterAll(() => {
  server.close()
})

describe('useSelfHostedCurrentUser', () => {
  function setup() {
    server.use(
      http.get('/internal/users/current', () => {
        return HttpResponse.json(user)
      })
    )
  }

  describe('when called', () => {
    describe('when data is loaded', () => {
      it('returns the user info', async () => {
        setup()
        const { result } = renderHook(
          () => useQueryV5(SelfHostedCurrentUserQueryOpts({ provider: 'gh' })),
          { wrapper }
        )

        await waitFor(() => expect(result.current.data).toEqual(user))
      })
    })
  })
})
