import { rest, graphql } from 'msw'
import { setupServer } from 'msw/node'
import { renderHook, act } from '@testing-library/react-hooks'
import { MemoryRouter, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from 'react-query'

import {
  useUser,
  useUpdateProfile,
  useMyContexts,
  useResyncUser,
  useOwner,
  useOnboardUser,
  useIsCurrentUserAnAdmin,
} from './hooks'

const user = {
  username: 'TerrySmithDC',
  email: 'terry@terry.com',
  name: 'terry',
  avatarUrl: 'photo',
  onboardingCompleted: false,
}

const queryClient = new QueryClient()
const wrapper = ({ children }) => (
  <MemoryRouter initialEntries={['/gh']}>
    <Route path="/:provider">
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </Route>
  </MemoryRouter>
)

const server = setupServer()

beforeAll(() => server.listen())
beforeEach(() => {
  server.resetHandlers()
  queryClient.clear()
})
afterAll(() => server.close())

describe('useUser', () => {
  let hookData

  function setup() {
    server.use(
      graphql.query('CurrentUser', (req, res, ctx) => {
        return res(ctx.status(200), ctx.data({ me: user }))
      })
    )
    hookData = renderHook(() => useUser(), { wrapper })
  }

  describe('when called', () => {
    beforeEach(() => {
      setup()
    })

    it('returns isLoading', () => {
      expect(hookData.result.current.isLoading).toBeTruthy()
    })
  })

  describe('when data is loaded', () => {
    beforeEach(() => {
      setup()
      return hookData.waitFor(() => hookData.result.current.isSuccess)
    })

    it('returns the user', () => {
      expect(hookData.result.current.data).toEqual(user)
    })
  })
})

describe('useUpdateProfile', () => {
  let hookData

  function setup() {
    server.use(
      graphql.mutation('UpdateProfile', (req, res, ctx) => {
        const newUser = {
          ...user,
          name: req.body.variables.input.name,
          email: req.body.variables.input.email,
        }
        return res(
          ctx.status(200),
          ctx.data({
            updateProfile: {
              me: newUser,
            },
          })
        )
      })
    )
    hookData = renderHook(() => useUpdateProfile({ provider: 'gh' }), {
      wrapper,
    })
  }

  describe('when called', () => {
    beforeEach(() => {
      setup()
    })

    it('is not loading yet', () => {
      expect(hookData.result.current.isLoading).toBeFalsy()
    })

    describe('when calling the mutation', () => {
      const newData = {
        email: 'newemail@test.com',
        name: 'new name',
      }
      beforeEach(() => {
        return act(async () => {
          hookData.result.current.mutate(newData)
          await hookData.waitFor(() => hookData.result.current.isLoading)
          await hookData.waitFor(() => !hookData.result.current.isLoading)
        })
      })

      it('returns success', () => {
        expect(hookData.result.current.isSuccess).toBeTruthy()
      })

      it('updates the local cache', () => {
        expect(queryClient.getQueryData(['currentUser', 'gh'])).toMatchObject({
          ...user,
          ...newData,
        })
      })
    })
  })
})

describe('useOnboardUser', () => {
  let hookData

  function setup(opts = null) {
    server.use(
      graphql.mutation('OnboardUser', (req, res, ctx) => {
        const newUser = {
          ...user,
          onboardingCompleted: true,
        }
        return res(
          ctx.status(200),
          ctx.data({
            onboardUser: {
              me: newUser,
            },
          })
        )
      })
    )
    hookData = renderHook(() => useOnboardUser(opts), {
      wrapper,
    })
  }

  describe('when called', () => {
    beforeEach(() => {
      setup()
    })

    it('is not loading yet', () => {
      expect(hookData.result.current.isLoading).toBeFalsy()
    })

    describe('when calling the mutation', () => {
      beforeEach(() => {
        return act(async () => {
          hookData.result.current.mutate({})
          await hookData.waitFor(() => hookData.result.current.isLoading)
          await hookData.waitFor(() => !hookData.result.current.isLoading)
        })
      })

      it('returns success', () => {
        expect(hookData.result.current.isSuccess).toBeTruthy()
      })

      it('updates the local cache', () => {
        expect(queryClient.getQueryData(['currentUser', 'gh'])).toMatchObject({
          ...user,
          onboardingCompleted: true,
        })
      })
    })
  })

  describe('when called with opts', () => {
    const onSuccessFn = jest.fn()
    beforeEach(() => {
      const opts = {
        onSuccess: onSuccessFn,
      }
      setup(opts)
      return act(async () => {
        hookData.result.current.mutate({})
        await hookData.waitFor(() => hookData.result.current.isLoading)
        await hookData.waitFor(() => !hookData.result.current.isLoading)
      })
    })

    it('returns onSuccess from opts', () => {
      expect(hookData.result.current.isSuccess).toBeTruthy()
      expect(onSuccessFn).toHaveBeenCalled()
    })
  })
})

describe('useMyContexts', () => {
  let hookData

  function setup(dataReturned) {
    server.use(
      rest.post(`/graphql/gh`, (req, res, ctx) => {
        return res(
          ctx.status(200),
          ctx.json({
            data: dataReturned,
          })
        )
      })
    )
    hookData = renderHook(() => useMyContexts(), { wrapper })
  }

  describe('when called and user is unauthenticated', () => {
    beforeEach(() => {
      setup({
        me: null,
      })
    })

    it('returns isLoading', () => {
      expect(hookData.result.current.isLoading).toBeTruthy()
    })

    describe('when data is loaded', () => {
      beforeEach(() => {
        return hookData.waitFor(() => hookData.result.current.isSuccess)
      })

      it('returns null', () => {
        expect(hookData.result.current.data).toEqual(null)
      })
    })
  })

  describe('when called and user is authenticated', () => {
    const org1 = {
      username: 'codecov',
      avatarUrl: '',
    }
    const org2 = {
      username: 'codecov',
      avatarUrl: '',
    }
    beforeEach(() => {
      setup({
        me: {
          owner: user,
          myOrganizations: {
            edges: [{ node: org1 }, { node: org2 }],
          },
        },
      })
      return hookData.waitFor(() => hookData.result.current.isSuccess)
    })

    it('returns the user and their orgs', () => {
      expect(hookData.result.current.data).toEqual({
        currentUser: user,
        myOrganizations: [org1, org2],
      })
    })
  })
})

describe('useOwner', () => {
  let hookData

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
    hookData = renderHook(() => useOwner({ username: 'codecov' }), { wrapper })
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
      return hookData.waitFor(() => hookData.result.current.isSuccess)
    })

    it('returns the org', () => {
      expect(hookData.result.current.data).toEqual(codecovOrg)
    })
  })

  describe('when calling useIsCurrentUserAnAdmin for admins', () => {
    const codecovOrg = {
      username: 'codecov',
      avatarUrl: '',
      isCurrentUserPartOfOrg: true,
      isAdmin: true,
    }
    beforeEach(() => {
      setup(codecovOrg)
      hookData = renderHook(
        () => useIsCurrentUserAnAdmin({ owner: 'codecov' }),
        { wrapper }
      )
      return hookData.waitFor(() => hookData.result.current.isSuccess)
    })

    it('returns true value', () => {
      expect(hookData.result.current).toEqual(true)
    })
  })

  describe('when calling useIsCurrentUserAnAdmin for non-admins', () => {
    const codecovOrg = {
      username: 'codecov',
      avatarUrl: '',
      isCurrentUserPartOfOrg: true,
      isAdmin: false,
    }
    beforeEach(() => {
      setup(codecovOrg)
      hookData = renderHook(
        () => useIsCurrentUserAnAdmin({ owner: 'codecov' }),
        { wrapper }
      )
      return hookData.waitFor(() => hookData.result.current.isSuccess)
    })

    it('returns false value', () => {
      expect(hookData.result.current).toEqual(false)
    })
  })
})

describe('useResyncUser', () => {
  let hookData

  let syncStatus = false

  function setup() {
    server.use(
      graphql.query('IsSyncing', (req, res, ctx) => {
        return res(
          ctx.data({
            me: {
              isSyncing: syncStatus,
            },
          })
        )
      }),
      graphql.mutation('SyncData', (req, res, ctx) => {
        syncStatus = true
        return res(
          ctx.data({
            syncWithGitProvider: {
              me: {
                isSyncing: syncStatus,
              },
            },
          })
        )
      })
    )
    hookData = renderHook(() => useResyncUser(), { wrapper })
  }

  describe('when the hook is called and the syncing is not in progress', () => {
    beforeEach(() => {
      syncStatus = false
      setup()
    })

    it('returns syncing false', () => {
      expect(hookData.result.current.isSyncing).toBeFalsy()
    })
  })

  describe('when the user trigger a sync', () => {
    beforeEach(() => {
      syncStatus = false
      setup()
      return act(() => {
        // triggerResync returns a promise on which we can await
        return hookData.result.current.triggerResync()
      })
    })

    it('returns syncing true', () => {
      expect(hookData.result.current.isSyncing).toBeTruthy()
    })
  })

  describe('when the hook is called and the syncing is in progress', () => {
    beforeEach(() => {
      syncStatus = true
      setup()
      return hookData.waitFor(() => hookData.result.current.isSyncing)
    })

    it('returns syncing true', () => {
      expect(hookData.result.current.isSyncing).toBeTruthy()
    })
  })

  describe('when a sync finises', () => {
    let refetchQueriesSpy
    beforeEach(async () => {
      refetchQueriesSpy = jest.spyOn(queryClient, 'refetchQueries')
      syncStatus = true
      setup()
      await hookData.waitFor(() => hookData.result.current.isSyncing)
      // sync on server finishes
      syncStatus = false
      // and wait for the request to get the new isSyncing
      await hookData.waitFor(() => !hookData.result.current.isSyncing, {
        // we need to make a longer timeout because the polling of the
        // isSyncing is 2000ms; and we can't use fake timers as it
        // doesn't work well with waitFor()
        timeout: 3000,
      })
    })

    it('returns syncing false', () => {
      expect(hookData.result.current.isSyncing).toBeFalsy()
    })

    it('calls refetchQueries for repos', () => {
      expect(refetchQueriesSpy).toHaveBeenCalledWith(['repos'])
    })
  })
})
