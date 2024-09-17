import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw2'
import { setupServer } from 'msw2/node'
import React from 'react'
import { MemoryRouter, Route } from 'react-router-dom'
import { MockInstance } from 'vitest'

import { useRepoBackfilled } from './useRepoBackfilled'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})

const wrapper =
  (initialEntries = '/gh/codecov/test'): React.FC<React.PropsWithChildren> =>
  ({ children }) => (
    <MemoryRouter initialEntries={[initialEntries]}>
      <Route path="/:provider/:owner/:repo">
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </Route>
    </MemoryRouter>
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

describe('useRepoBackfilled', () => {
  const dataReturned = {
    owner: {
      repository: {
        __typename: 'Repository',
        coverageAnalytics: {
          flagsMeasurementsActive: true,
          flagsMeasurementsBackfilled: true,
        },
      },
    },
  }

  const mockUnsuccessfulParseError = {}

  const mockRepoNotFound = {
    owner: {
      repository: {
        __typename: 'NotFoundError',
        message: 'Repository not found',
      },
    },
  }

  const mockOwnerNotActivated = {
    owner: {
      repository: {
        __typename: 'OwnerNotActivatedError',
        message: 'Owner not activated',
      },
    },
  }

  interface SetupArgs {
    isNotFoundError?: boolean
    isOwnerNotActivatedError?: boolean
    isUnsuccessfulParseError?: boolean
  }

  function setup({
    isNotFoundError = false,
    isOwnerNotActivatedError = false,
    isUnsuccessfulParseError = false,
  }: SetupArgs) {
    server.use(
      graphql.query('BackfillFlagMemberships', (info) => {
        if (isNotFoundError) {
          return HttpResponse.json({ data: mockRepoNotFound })
        } else if (isOwnerNotActivatedError) {
          return HttpResponse.json({ data: mockOwnerNotActivated })
        } else if (isUnsuccessfulParseError) {
          return HttpResponse.json({ data: mockUnsuccessfulParseError })
        } else {
          return HttpResponse.json({ data: dataReturned })
        }
      })
    )
  }

  describe('when called', () => {
    describe('when data is loaded', () => {
      it('returns the data', async () => {
        setup({})
        const { result } = renderHook(() => useRepoBackfilled(), {
          wrapper: wrapper(),
        })

        const expectedResponse = {
          __typename: 'Repository',
          coverageAnalytics: {
            flagsMeasurementsActive: true,
            flagsMeasurementsBackfilled: true,
          },
        }
        await waitFor(() =>
          expect(result.current.data).toEqual(expectedResponse)
        )
      })
    })

    describe('can throw errors', () => {
      let consoleSpy: MockInstance
      beforeAll(() => {
        consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      })

      afterAll(() => {
        consoleSpy.mockRestore()
      })

      it('can return unsuccessful parse error', async () => {
        setup({ isUnsuccessfulParseError: true })
        const { result } = renderHook(() => useRepoBackfilled(), {
          wrapper: wrapper(),
        })

        await waitFor(() => expect(result.current.isError).toBeTruthy())
        await waitFor(() =>
          expect(result.current.error).toEqual(
            expect.objectContaining({
              status: 404,
            })
          )
        )
      })

      it('can return not found error', async () => {
        setup({ isNotFoundError: true })
        const { result } = renderHook(() => useRepoBackfilled(), {
          wrapper: wrapper(),
        })

        await waitFor(() => expect(result.current.isError).toBeTruthy())
        await waitFor(() =>
          expect(result.current.error).toEqual(
            expect.objectContaining({
              status: 404,
            })
          )
        )
      })

      it('can return owner not activated error', async () => {
        setup({ isOwnerNotActivatedError: true })
        const { result } = renderHook(() => useRepoBackfilled(), {
          wrapper: wrapper(),
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
})
