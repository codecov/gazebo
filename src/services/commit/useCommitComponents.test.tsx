import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'
import { type MockInstance } from 'vitest'

import { useCommitComponents } from './useCommitComponents'

const mockCommitComponentData = {
  owner: {
    repository: {
      __typename: 'Repository',
      commit: {
        coverageAnalytics: {
          components: [{ name: 'component-1' }, { name: 'component-2' }],
        },
      },
    },
  },
}

const mockNullOwner = {
  owner: null,
}

const mockUnsuccessfulParseError = {}

const mockNotFoundError = {
  owner: {
    repository: {
      __typename: 'NotFoundError',
      message: 'commit not found',
    },
  },
}

const mockOwnerNotActivatedError = {
  owner: {
    repository: {
      __typename: 'OwnerNotActivatedError',
      message: 'owner not activated',
    },
  },
}

const server = setupServer()
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
})

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter initialEntries={['/gh/codecov/gazebo/']}>
      <Route path="/:provider/:owner/:repo/">{children}</Route>
    </MemoryRouter>
  </QueryClientProvider>
)

beforeAll(() => {
  server.listen()
})

afterEach(() => {
  queryClient.clear()
  server.resetHandlers()
})

afterAll(() => {
  server.close()
})

interface SetupArgs {
  isUnsuccessfulParseError?: boolean
  isNullOwner?: boolean
  isOwnerNotActivatedError?: boolean
  isNotFoundError?: boolean
}

describe('useCommitComponents', () => {
  function setup({
    isUnsuccessfulParseError = false,
    isNullOwner = false,
    isNotFoundError = false,
    isOwnerNotActivatedError = false,
  }: SetupArgs = {}) {
    server.use(
      graphql.query('CommitComponents', () => {
        if (isNotFoundError) {
          return HttpResponse.json({ data: mockNotFoundError })
        } else if (isOwnerNotActivatedError) {
          return HttpResponse.json({ data: mockOwnerNotActivatedError })
        } else if (isUnsuccessfulParseError) {
          return HttpResponse.json({ data: mockUnsuccessfulParseError })
        } else if (isNullOwner) {
          return HttpResponse.json({ data: mockNullOwner })
        } else {
          return HttpResponse.json({ data: mockCommitComponentData })
        }
      })
    )
  }

  describe('api returns valid response', () => {
    it('returns components info', async () => {
      setup()
      const { result } = renderHook(() => useCommitComponents(), { wrapper })
      const expectedResult = {
        components: [{ name: 'component-1' }, { name: 'component-2' }],
      }
      await waitFor(() =>
        expect(result.current.data).toStrictEqual(expectedResult)
      )
    })
  })

  describe('there is a null owner', () => {
    it('returns a null value', async () => {
      setup({ isNullOwner: true })

      const { result } = renderHook(() => useCommitComponents(), { wrapper })

      await waitFor(() => expect(result.current.data).toBeUndefined())
    })
  })

  describe('unsuccessful parse of zod schema', () => {
    let consoleSpy: MockInstance

    beforeEach(() => {
      consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => null)
    })

    afterEach(() => {
      consoleSpy.mockRestore()
    })

    it('throws a 404', async () => {
      setup({ isUnsuccessfulParseError: true })
      const { result } = renderHook(() => useCommitComponents(), { wrapper })

      await waitFor(() => expect(result.current.isError).toBeTruthy())
      await waitFor(() =>
        expect(result.current.error).toEqual(
          expect.objectContaining({
            status: 404,
            data: {
              message: 'Error parsing commit components data',
            },
          })
        )
      )
    })
  })

  describe('returns NotFoundError __typename', () => {
    let consoleSpy: MockInstance

    beforeEach(() => {
      consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => null)
    })

    afterEach(() => {
      consoleSpy.mockRestore()
    })

    it('throws a 404', async () => {
      setup({ isNotFoundError: true })
      const { result } = renderHook(() => useCommitComponents(), {
        wrapper,
      })

      await waitFor(() => expect(result.current.isError).toBeTruthy())
      await waitFor(() =>
        expect(result.current.error).toEqual(
          expect.objectContaining({
            status: 404,
            data: {
              message: 'Repo not found',
            },
          })
        )
      )
    })
  })

  describe('returns OwnerNotActivatedError __typename', () => {
    let consoleSpy: MockInstance

    beforeEach(() => {
      consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => null)
    })

    afterEach(() => {
      consoleSpy.mockRestore()
    })

    it('throws a 403', async () => {
      setup({ isOwnerNotActivatedError: true })
      const { result } = renderHook(() => useCommitComponents(), {
        wrapper,
      })

      await waitFor(() => expect(result.current.isError).toBeTruthy())
      await waitFor(() =>
        expect(result.current.error).toEqual(
          expect.objectContaining({
            status: 403,
          })
        )
      )
    })
  })
})
