import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook } from '@testing-library/react-hooks'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import { useIsCurrentUserAnAdmin } from './useIsCurrentUserAnAdmin'
import { useOwner } from './useOwner'

const server = setupServer()
const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
  logger: {
    error: () => {},
  },
})
const wrapper =
  (initialEntries = '/gh') =>
  ({ children }) =>
    (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[initialEntries]}>
          <Route path="/:provider">{children}</Route>
        </MemoryRouter>
      </QueryClientProvider>
    )

beforeAll(() => server.listen())
beforeEach(() => {
  server.resetHandlers()
  queryClient.clear()
})
afterAll(() => server.close())

describe('useOwner', () => {
  function setup(dataReturned) {
    server.use(
      graphql.query('DetailOwner', (req, res, ctx) => {
        return res(
          ctx.data({
            owner: dataReturned,
          })
        )
      })
    )
  }

  describe('when called and user is authenticated', () => {
    const codecovOrg = {
      username: 'codecov',
      avatarUrl: '',
      isCurrentUserPartOfOrg: true,
      isAdmin: false,
    }

    beforeEach(() => {
      setup(codecovOrg)
    })

    it('returns the org', async () => {
      const { result, waitFor } = renderHook(
        () => useOwner({ username: 'codecov' }),
        {
          wrapper: wrapper(),
        }
      )

      await waitFor(() => expect(result.current.data).toEqual(codecovOrg))
    })
  })

  describe('when calling useIsCurrentUserAnAdmin for admins', () => {
    const codecovOrg = {
      username: 'codecov',
      avatarUrl: '',
      isCurrentUserPartOfOrg: true,
      isAdmin: true,
    }
    beforeEach(async () => {
      setup(codecovOrg)
    })

    it('returns true value', async () => {
      const { result: firstResult, waitFor: firstWaitFor } = renderHook(
        () => useOwner({ username: 'codecov' }),
        {
          wrapper: wrapper(),
        }
      )

      await firstWaitFor(() => expect(firstResult.current.isSuccess))

      const { result: secondResult, waitFor: secondWaitFor } = renderHook(
        () => useIsCurrentUserAnAdmin({ owner: 'codecov' }),
        { wrapper }
      )

      secondWaitFor(() => expect(secondResult.current).toEqual(true))
    })
  })

  describe('when calling useIsCurrentUserAnAdmin for non-admins', () => {
    const codecovOrg = {
      username: 'codecov',
      avatarUrl: '',
      isCurrentUserPartOfOrg: true,
      isAdmin: false,
    }

    beforeEach(async () => {
      setup(codecovOrg)
    })

    it('returns false value', async () => {
      const { result: firstResult, waitFor: firstWaitFor } = renderHook(
        () => useOwner({ username: 'codecov' }),
        {
          wrapper: wrapper(),
        }
      )

      await firstWaitFor(() => expect(firstResult.current.isSuccess))

      const { result: secondResult, waitFor: secondWaitFor } = renderHook(
        () => useIsCurrentUserAnAdmin({ owner: 'codecov' }),
        { wrapper }
      )

      await secondWaitFor(() => expect(secondResult.current).toBeUndefined())
    })
  })

  describe('when calling useIsCurrentUserAnAdmin for undefined owners', () => {
    beforeEach(() => {
      setup()
    })

    it('returns false', async () => {
      const { result: firstResult, waitFor: firstWaitFor } = renderHook(
        () => useOwner({ username: 'codecov' }),
        {
          wrapper: wrapper(),
        }
      )

      await firstWaitFor(() => expect(firstResult.current.isSuccess))

      const { result: secondResult, waitFor: secondWaitFor } = renderHook(
        () => useIsCurrentUserAnAdmin({ owner: 'codecov' }),
        { wrapper }
      )

      await secondWaitFor(() => expect(secondResult.current).toBeUndefined())
    })
  })
})
