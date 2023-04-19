import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook } from '@testing-library/react-hooks'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import { useMyOrganizations } from './useMyOrganizations'
import type { MyOrganizationsData } from './useMyOrganizations'

const queryClient = new QueryClient()

type WrapperClosure = (
  initialEntries?: string[]
) => React.FC<React.PropsWithChildren>
const wrapper: WrapperClosure =
  (initialEntries = ['/gh']) =>
  ({ children }) =>
    (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={initialEntries}>
          <Route path="/:provider">{children}</Route>
        </MemoryRouter>
      </QueryClientProvider>
    )

const server = setupServer()

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }))
beforeEach(() => {
  server.resetHandlers()
  queryClient.clear()
})
afterAll(() => server.close())

describe('useMyOrganizations', () => {
  interface Setup {
    MyOrganizationsData?: MyOrganizationsData
    apiError?: boolean
  }
  function setup({ MyOrganizationsData = {}, apiError = false }: Setup) {
    const spy = jest.spyOn(console, 'error')
    const thrownMock = jest.fn()
    spy.mockImplementation(thrownMock)

    server.use(
      graphql.query('UseMyOrganizations', (req, res, ctx) => {
        if (apiError) {
          return res.networkError('Failed to connect')
        }
        return res(ctx.status(200), ctx.data(MyOrganizationsData))
      })
    )

    return { thrownMock }
  }

  describe('when query resolves', () => {
    describe('there is organization data', () => {
      it('returns the user', async () => {
        const { thrownMock } = setup({
          MyOrganizationsData: {
            me: {
              myOrganizations: {
                edges: [
                  {
                    node: {
                      avatarUrl:
                        'https://avatars0.githubusercontent.com/u/8226205?v=3&s=55',
                      username: 'codecov',
                      ownerid: 1,
                    },
                  },
                ],
                pageInfo: { hasNextPage: false, endCursor: 'MTI=' },
              },
            },
          },
        })

        const { result, waitFor } = renderHook(() => useMyOrganizations(), {
          wrapper: wrapper(),
        })

        await waitFor(() => expect(result.current.isSuccess).toBe(true))
        expect(thrownMock).not.toBeCalled()

        expect(result.current.data).toEqual({
          pageParams: [undefined],
          pages: [
            {
              me: {
                myOrganizations: {
                  edges: [
                    {
                      node: {
                        avatarUrl:
                          'https://avatars0.githubusercontent.com/u/8226205?v=3&s=55',
                        ownerid: 1,
                        username: 'codecov',
                      },
                    },
                  ],
                  pageInfo: {
                    endCursor: 'MTI=',
                    hasNextPage: false,
                  },
                },
              },
            },
          ],
        })
      })
    })

    describe('there is no organization data', () => {
      it('returns the null', async () => {
        const { thrownMock } = setup({
          MyOrganizationsData: {
            me: {
              myOrganizations: {
                edges: [],
                pageInfo: { hasNextPage: false, endCursor: 'MTI=' },
              },
            },
          },
        })
        const { result, waitFor } = renderHook(() => useMyOrganizations(), {
          wrapper: wrapper(),
        })

        await waitFor(() => expect(result.current.isSuccess).toBe(true))
        expect(thrownMock).not.toBeCalled()

        expect(result.current.data).toEqual({
          pageParams: [undefined],
          pages: [
            {
              me: {
                myOrganizations: {
                  edges: [],
                  pageInfo: {
                    endCursor: 'MTI=',
                    hasNextPage: false,
                  },
                },
              },
            },
          ],
        })
      })
    })

    describe('the user is not authenticated', () => {
      it('throws error', async () => {
        const { thrownMock } = setup({ MyOrganizationsData: { me: null } })
        const { result, waitFor } = renderHook(() => useMyOrganizations(), {
          wrapper: wrapper(),
        })

        await waitFor(() => expect(result.current.isSuccess).toBeTruthy())

        expect(thrownMock).toBeCalledWith(
          'Error at useMyOrganizations: Unauthenticated'
        )
        expect(result.current.data).toEqual({
          pageParams: [undefined],
          pages: [undefined],
        })
      })
    })

    describe('there is was an api error', () => {
      it('returns the user', async () => {
        const { thrownMock } = setup({ apiError: true })
        const { result, waitFor } = renderHook(() => useMyOrganizations(), {
          wrapper: wrapper(),
        })

        await waitFor(() => expect(result.current.isSuccess).toBeTruthy())

        expect(thrownMock).toBeCalledWith('POST /graphql/gh net::ERR_FAILED')
        expect(thrownMock).toBeCalledWith(
          'Error at useMyOrganizations: Failed to fetch'
        )
        expect(result.current.data).toEqual({
          pageParams: [undefined],
          pages: [undefined],
        })
      })
    })
  })

  describe('when there is no provider', () => {
    it(`Doesn't run hook at all`, async () => {
      setup({ MyOrganizationsData: { me: null } })
      const { result } = renderHook(() => useMyOrganizations(), {
        wrapper: wrapper(['']),
      })
      expect(result.current).toEqual(undefined)
    })
  })
})
