import { renderHook, waitFor } from 'custom-testing-library'

import {
  QueryClientProvider as QueryClientProviderV5,
  QueryClient as QueryClientV5,
  useQuery as useQueryV5,
} from '@tanstack/react-queryV5'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router'

import {
  OwnerContextQueryOpts,
  RepoContextQueryOpts,
  useEventContext,
} from './hooks'

const mockOwnerContext = {
  owner: {
    ownerid: 123,
  },
}

const mockRepoContext = {
  owner: {
    repository: {
      __typename: 'Repository',
      repoid: 321,
      private: false,
    },
  },
}

const mockedSetContext = vi.hoisted(() => vi.fn())
vi.mock('./events', () => ({
  eventTracker: () => ({
    setContext: mockedSetContext,
  }),
}))

const server = setupServer()
const queryClientV5 = new QueryClientV5({
  defaultOptions: { queries: { retry: false } },
})

const ownerWrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <QueryClientProviderV5 client={queryClientV5}>
    <MemoryRouter initialEntries={['/gh/codecov']}>
      <Route path="/:provider/:owner">{children}</Route>
    </MemoryRouter>
  </QueryClientProviderV5>
)

const repoWrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <QueryClientProviderV5 client={queryClientV5}>
    <MemoryRouter initialEntries={['/gh/codecov/gazebo']}>
      <Route path="/:provider/:owner/:repo">{children}</Route>
    </MemoryRouter>
  </QueryClientProviderV5>
)

beforeAll(() => {
  server.listen()
})

afterEach(() => {
  vi.clearAllMocks()
  queryClientV5.clear()
  server.resetHandlers()
})

afterAll(() => {
  server.close()
})

interface SetupArgs {
  badOwner?: boolean
  nullOwnerid?: boolean
  badRepo?: boolean
  repoError?: 'NotFoundError' | 'OwnerNotActivatedError'
}

describe('useEventContext', () => {
  function setup({
    badOwner = false,
    nullOwnerid = false,
    badRepo = false,
    repoError,
  }: SetupArgs) {
    server.use(
      graphql.query('OwnerContext', () => {
        if (badOwner) {
          return HttpResponse.json({ data: {} })
        }
        if (nullOwnerid) {
          return HttpResponse.json({ data: { owner: { ownerid: null } } })
        }
        return HttpResponse.json({ data: mockOwnerContext })
      }),
      graphql.query('RepoContext', () => {
        if (badRepo) {
          return HttpResponse.json({
            data: {},
          })
        }
        if (repoError) {
          return HttpResponse.json({
            data: {
              owner: {
                repository: { __typename: repoError, message: repoError },
              },
            },
          })
        }
        return HttpResponse.json({
          data: mockRepoContext,
        })
      })
    )
  }

  describe('when called on owner page', () => {
    it('sets event context with path, ownerid, and no repoid', async () => {
      setup({})
      renderHook(() => useEventContext(), {
        wrapper: ownerWrapper,
      })

      await waitFor(() => {
        expect(mockedSetContext).toHaveBeenCalledWith({
          path: '/:provider/:owner',
          ownerid: mockOwnerContext.owner.ownerid,
        })
      })
    })
  })

  describe('when called on repo page', () => {
    it('sets event context with path, ownerid, and repoid', async () => {
      setup({})
      renderHook(useEventContext, {
        wrapper: repoWrapper,
      })

      await waitFor(() => {
        expect(mockedSetContext).toHaveBeenCalledWith({
          path: '/:provider/:owner/:repo',
          ownerid: mockOwnerContext.owner.ownerid,
          repoid: mockRepoContext.owner.repository.repoid,
          repoIsPrivate: mockRepoContext.owner.repository.private,
        })
      })
    })
  })

  describe('when called with null ownerid', () => {
    it('sets event context with undefined ownerid', async () => {
      setup({ nullOwnerid: true })
      renderHook(() => useEventContext(), {
        wrapper: ownerWrapper,
      })

      await waitFor(() => {
        expect(mockedSetContext).toHaveBeenCalledWith({
          path: '/:provider/:owner',
        })
      })
    })
  })

  describe('OwnerContext hook', () => {
    describe('when bad data is returned', () => {
      it('rejects with 404 failed to parse', async () => {
        setup({ badOwner: true })
        const { result } = renderHook(
          () =>
            useQueryV5(
              OwnerContextQueryOpts({ provider: 'gh', owner: 'codecov' })
            ),
          {
            wrapper: ownerWrapper,
          }
        )

        await waitFor(() =>
          expect(result.current.error).toEqual(
            expect.objectContaining({
              dev: 'OwnerContextQueryOpts - Parsing Error',
              status: 400,
            })
          )
        )
      })
    })

    describe('when good data is returned', () => {
      it('returns owner context data', async () => {
        setup({})
        const { result } = renderHook(
          () =>
            useQueryV5(
              OwnerContextQueryOpts({ provider: 'gh', owner: 'codecov' })
            ),
          {
            wrapper: ownerWrapper,
          }
        )

        await waitFor(() =>
          expect(result.current.data).toEqual(mockOwnerContext.owner)
        )
      })
    })
  })

  describe('RepoContext hook', () => {
    describe('when bad data is returned', () => {
      it('rejects with 404 failed to parse', async () => {
        setup({ badRepo: true })
        const { result } = renderHook(
          () =>
            useQueryV5(
              RepoContextQueryOpts({
                provider: 'gh',
                owner: 'codecov',
                repo: 'gazebo',
              })
            ),
          {
            wrapper: repoWrapper,
          }
        )

        await waitFor(() =>
          expect(result.current.error).toEqual(
            expect.objectContaining({
              dev: 'RepoContextQueryOpts - Parsing Error',
              status: 400,
            })
          )
        )
      })
    })

    describe('when NotFoundError is returned', () => {
      it('rejects with 404 not found', async () => {
        setup({ repoError: 'NotFoundError' })
        const { result } = renderHook(
          () =>
            useQueryV5(
              RepoContextQueryOpts({
                provider: 'gh',
                owner: 'codecov',
                repo: 'gazebo',
              })
            ),
          {
            wrapper: repoWrapper,
          }
        )

        await waitFor(() =>
          expect(result.current.error).toEqual(
            expect.objectContaining({
              dev: 'RepoContextQueryOpts - Not Found Error',
              status: 404,
            })
          )
        )
      })
    })

    describe('when OwnerNotActivatedError is returned', () => {
      it('rejects with 403', async () => {
        setup({ repoError: 'OwnerNotActivatedError' })
        const { result } = renderHook(
          () =>
            useQueryV5(
              RepoContextQueryOpts({
                provider: 'gh',
                owner: 'codecov',
                repo: 'gazebo',
              })
            ),
          {
            wrapper: repoWrapper,
          }
        )

        await waitFor(() =>
          expect(result.current.error).toEqual(
            expect.objectContaining({
              dev: 'RepoContextQueryOpts - Owner Not Activated',
              status: 403,
            })
          )
        )
      })
    })

    describe('when good data is returned', () => {
      it('returns repo context data', async () => {
        setup({})
        const { result } = renderHook(
          () =>
            useQueryV5(
              RepoContextQueryOpts({
                provider: 'gh',
                owner: 'codecov',
                repo: 'gazebo',
              })
            ),
          {
            wrapper: repoWrapper,
          }
        )

        await waitFor(() =>
          expect(result.current.data).toEqual(mockRepoContext.owner.repository)
        )
      })
    })
  })
})
