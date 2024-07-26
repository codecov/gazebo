import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import React from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

import { accountDetailsObject, accountDetailsParsedObj } from './mocks'
import { useAccountDetails } from './useAccountDetails'

jest.mock('js-cookie')

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})
const wrapper =
  (initialEntries = '/gh'): React.FC<React.PropsWithChildren> =>
  ({ children }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialEntries]}>
        <Route path="/:provider">{children}</Route>
      </MemoryRouter>
    </QueryClientProvider>
  )

const provider = 'gh'
const owner = 'codecov'

const server = setupServer()

beforeAll(() => {
  // We still want to test our zod schema for any changes against the mocks
  process.env.REACT_APP_ZOD_IGNORE_TESTS = 'false'
  server.listen()
})
afterEach(() => {
  queryClient.clear()
  server.resetHandlers()
})
afterAll(() => {
  process.env.REACT_APP_ZOD_IGNORE_TESTS = 'true'
  server.close()
})

describe('useAccountDetails', () => {
  function setup() {
    server.use(
      rest.get(
        `/internal/${provider}/${owner}/account-details/`,
        (req, res, ctx) => {
          return res(ctx.status(200), ctx.json(accountDetailsObject))
        }
      )
    )
  }

  describe('when called', () => {
    beforeEach(() => {
      setup()
    })

    it('returns the data', async () => {
      const { result } = renderHook(
        () => useAccountDetails({ provider, owner }),
        {
          wrapper: wrapper(),
        }
      )

      await waitFor(() =>
        expect(result.current.data).toEqual(accountDetailsParsedObj)
      )
    })
  })
})
