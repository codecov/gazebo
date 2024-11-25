import {
  QueryClientProvider as QueryClientProviderV5,
  QueryClient as QueryClientV5,
  useQuery as useQueryV5,
} from '@tanstack/react-queryV5'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { type MockInstance } from 'vitest'

import { NavigatorDataQueryOpts } from './NavigatorDataQueryOpts'

const mockRepositoryData = {
  owner: {
    isCurrentUserPartOfOrg: true,
    repository: {
      __typename: 'Repository',
      name: 'test-repo',
    },
  },
}

const mockOwnerNotActivatedData = {
  owner: {
    ...mockRepositoryData.owner,
    repository: {
      __typename: 'OwnerNotActivatedError',
      message: 'Owner not activated',
    },
  },
}

const mockNotFoundErrorData = {
  owner: {
    ...mockRepositoryData.owner,
    repository: {
      __typename: 'NotFoundError',
      message: 'Repository not found',
    },
  },
}

const server = setupServer()
const queryClientV5 = new QueryClientV5({
  defaultOptions: { queries: { retry: false } },
})

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <QueryClientProviderV5 client={queryClientV5}>
    {children}
  </QueryClientProviderV5>
)

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

interface SetupArgs {
  isFound?: boolean
  isOwnerNotActivated?: boolean
  isParsingError?: boolean
}

describe('NavigatorDataQueryOpts', () => {
  function setup({
    isFound = true,
    isOwnerNotActivated = false,
    isParsingError = false,
  }: SetupArgs) {
    server.use(
      graphql.query('NavigatorData', () => {
        if (isOwnerNotActivated) {
          return HttpResponse.json({ data: mockOwnerNotActivatedData })
        } else if (!isFound) {
          return HttpResponse.json({ data: mockNotFoundErrorData })
        } else if (isParsingError) {
          return HttpResponse.json({ data: {} })
        }
        return HttpResponse.json({ data: mockRepositoryData })
      })
    )
  }

  describe('repository is Repository', () => {
    it('returns hasRepoAccess as true', async () => {
      setup({ isFound: true })

      const { result } = renderHook(
        () =>
          useQueryV5(
            NavigatorDataQueryOpts({
              provider: 'gh',
              owner: 'test-owner',
              repo: 'test-repo',
            })
          ),
        { wrapper }
      )

      await waitFor(() =>
        expect(result.current.data).toEqual({
          hasRepoAccess: true,
          isCurrentUserPartOfOrg: true,
        })
      )
    })
  })

  describe('repository is OwnerNotActivated', () => {
    it('returns hasRepoAccess as true', async () => {
      setup({ isOwnerNotActivated: true })

      const { result } = renderHook(
        () =>
          useQueryV5(
            NavigatorDataQueryOpts({
              provider: 'gh',
              owner: 'test-owner',
              repo: 'test-repo',
            })
          ),
        { wrapper }
      )

      await waitFor(() =>
        expect(result.current.data).toEqual({
          hasRepoAccess: true,
          isCurrentUserPartOfOrg: true,
        })
      )
    })
  })

  describe('repository is NotFoundError', () => {
    it('returns hasRepoAccess as false', async () => {
      setup({ isFound: false })

      const { result } = renderHook(
        () =>
          useQueryV5(
            NavigatorDataQueryOpts({
              provider: 'gh',
              owner: 'test-owner',
              repo: 'test-repo',
            })
          ),
        { wrapper }
      )

      await waitFor(() =>
        expect(result.current.data).toEqual({
          hasRepoAccess: false,
          isCurrentUserPartOfOrg: true,
        })
      )
    })
  })

  describe('parsing error occurs', () => {
    let consoleSpy: MockInstance
    beforeEach(() => {
      consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => null)
    })
    afterEach(() => {
      consoleSpy.mockRestore()
    })

    it('rejects the network request', async () => {
      setup({ isParsingError: true })

      const { result } = renderHook(
        () =>
          useQueryV5(
            NavigatorDataQueryOpts({
              provider: 'gh',
              owner: 'test-owner',
              repo: 'test-repo',
            })
          ),
        { wrapper }
      )

      await waitFor(() => expect(result.current.isError).toBeTruthy())
      await waitFor(() =>
        expect(result.current.error).toEqual(
          expect.objectContaining({
            status: 404,
            dev: 'NavigatorDataQueryOpts - 404 Failed to parse data',
          })
        )
      )
    })
  })
})
