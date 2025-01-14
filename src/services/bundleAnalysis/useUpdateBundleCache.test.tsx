import {
  QueryClientProvider as QueryClientProviderV5,
  QueryClient as QueryClientV5,
} from '@tanstack/react-queryV5'
import { act, renderHook, waitFor } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import { useUpdateBundleCache } from './useUpdateBundleCache'

const mockSuccessfulResponse = {
  data: {
    updateBundleCacheConfig: {
      results: [{ bundleName: 'bundle-1', isCached: true }],
      error: null,
    },
  },
}

const mockParsingError = {
  data: null,
  errors: [{ message: 'Parsing error' }],
}

const mockUnauthenticatedError = {
  data: {
    updateBundleCacheConfig: {
      results: null,
      error: {
        __typename: 'UnauthenticatedError',
        message: 'Unauthenticated error',
      },
    },
  },
}

const mockValidationError = {
  data: {
    updateBundleCacheConfig: {
      results: null,
      error: { __typename: 'ValidationError', message: 'Validation error' },
    },
  },
}

const queryClient = new QueryClientV5({
  defaultOptions: { mutations: { retry: false } },
})

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <QueryClientProviderV5 client={queryClient}>{children}</QueryClientProviderV5>
)

const server = setupServer()

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
  isParsingError?: boolean
  isUnauthenticatedError?: boolean
  isValidationError?: boolean
}

describe('useUpdateBundleCache', () => {
  function setup({
    isParsingError = false,
    isUnauthenticatedError = false,
    isValidationError = false,
  }: SetupArgs) {
    server.use(
      graphql.mutation('UpdateBundleCacheConfig', () => {
        if (isParsingError) {
          return HttpResponse.json(mockParsingError)
        } else if (isUnauthenticatedError) {
          return HttpResponse.json(mockUnauthenticatedError)
        } else if (isValidationError) {
          return HttpResponse.json(mockValidationError)
        }
        return HttpResponse.json(mockSuccessfulResponse)
      })
    )
  }

  describe('when the mutation is successful', () => {
    it('returns the updated results', async () => {
      setup({})
      const { result } = renderHook(
        () =>
          useUpdateBundleCache({
            provider: 'gh',
            owner: 'owner',
            repo: 'repo',
          }),
        { wrapper }
      )

      act(() =>
        result.current.mutate([{ bundleName: 'bundle-1', isCached: true }])
      )
      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(result.current.data).toEqual([
        { bundleName: 'bundle-1', isCached: true },
      ])
    })
  })

  describe('when the mutation fails', () => {
    describe('when the mutation fails with a parsing error', () => {
      it('returns a parsing error', async () => {
        setup({ isParsingError: true })
        const { result } = renderHook(
          () =>
            useUpdateBundleCache({
              provider: 'gh',
              owner: 'owner',
              repo: 'repo',
            }),
          { wrapper }
        )

        act(() =>
          result.current.mutate([{ bundleName: 'bundle-1', isCached: true }])
        )
        await waitFor(() => expect(result.current.isError).toBe(true))

        expect(result.current.error).toEqual({
          data: {},
          dev: 'useUpdateBundleCache - 400 failed to parse data',
          status: 400,
        })
      })
    })

    describe('when the mutation fails with an unauthenticated error', () => {
      it('returns an unauthenticated error', async () => {
        setup({ isUnauthenticatedError: true })
        const { result } = renderHook(
          () =>
            useUpdateBundleCache({
              provider: 'gh',
              owner: 'owner',
              repo: 'repo',
            }),
          { wrapper }
        )

        act(() =>
          result.current.mutate([{ bundleName: 'bundle-1', isCached: true }])
        )
        await waitFor(() => expect(result.current.isError).toBe(true))

        expect(result.current.error).toEqual({
          error: 'UnauthenticatedError',
          message: 'Unauthenticated error',
        })
      })
    })

    describe('when the mutation fails with a validation error', () => {
      it('returns a validation error', async () => {
        setup({ isValidationError: true })
        const { result } = renderHook(
          () =>
            useUpdateBundleCache({
              provider: 'gh',
              owner: 'owner',
              repo: 'repo',
            }),
          { wrapper }
        )

        act(() =>
          result.current.mutate([{ bundleName: 'bundle-1', isCached: true }])
        )

        await waitFor(() => expect(result.current.isError).toBe(true))

        expect(result.current.error).toEqual({
          error: 'ValidationError',
          message: 'Validation error',
        })
      })
    })
  })
})
