import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'
import { type MockInstance } from 'vitest'

import A from 'ui/A'

import { useComponentsBackfilled } from './index'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})

const wrapper =
  (
    initialEntries = '/gh/test-org/test-repo'
  ): React.FC<React.PropsWithChildren> =>
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

const dataReturned = {
  owner: {
    repository: {
      __typename: 'Repository',
      coverageAnalytics: {
        componentsMeasurementsActive: true,
        componentsMeasurementsBackfilled: true,
      },
    },
  },
}

describe('useComponentsBackfilled', () => {
  function setup({ isSchemaValid = true } = {}) {
    server.use(
      graphql.query('BackfillComponentMemberships', () => {
        if (!isSchemaValid) {
          return HttpResponse.json({})
        }
        return HttpResponse.json({ data: dataReturned })
      })
    )
  }

  describe('when called', () => {
    describe('when response is a valid schema', () => {
      it('returns the data', async () => {
        setup()
        const { result } = renderHook(() => useComponentsBackfilled(), {
          wrapper: wrapper(),
        })

        const expectedResponse = {
          componentsMeasurementsActive: true,
          componentsMeasurementsBackfilled: true,
        }
        await waitFor(() =>
          expect(result.current.data).toEqual(expectedResponse)
        )
      })
    })
  })

  describe('when the schema is invalid', () => {
    let consoleSpy: MockInstance
    beforeAll(() => {
      consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    })

    afterAll(() => {
      consoleSpy.mockRestore()
    })

    it('returns an error', async () => {
      setup({ isSchemaValid: false })
      const { result } = renderHook(() => useComponentsBackfilled(), {
        wrapper: wrapper(),
      })

      await waitFor(() =>
        expect(result.current.error).toEqual({
          status: 404,
          data: {},
          dev: 'useComponentsBackfilled - 404 failed to parse',
        })
      )
    })
  })

  describe('when repo is not found', () => {
    let consoleSpy: MockInstance
    beforeAll(() => {
      consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    })

    afterAll(() => {
      consoleSpy.mockRestore()
    })

    beforeEach(() => {
      server.use(
        graphql.query('BackfillComponentMemberships', () => {
          return HttpResponse.json({
            data: {
              owner: {
                repository: {
                  __typename: 'NotFoundError',
                  message: 'Repo not found',
                },
              },
            },
          })
        })
      )
    })

    it('returns an error', async () => {
      const { result } = renderHook(() => useComponentsBackfilled(), {
        wrapper: wrapper(),
      })

      await waitFor(() =>
        expect(result.current.error).toEqual({
          status: 404,
          data: {},
          dev: 'useComponentsBackfilled - 404 NotFoundError',
        })
      )
    })
  })

  describe('when owner is not activated', () => {
    let consoleSpy: MockInstance
    beforeAll(() => {
      consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    })

    afterAll(() => {
      consoleSpy.mockRestore()
    })

    beforeEach(() => {
      server.use(
        graphql.query('BackfillComponentMemberships', () => {
          return HttpResponse.json({
            data: {
              owner: {
                repository: {
                  __typename: 'OwnerNotActivatedError',
                  message: 'Owner not activated',
                },
              },
            },
          })
        })
      )
    })

    it('returns an error', async () => {
      const { result } = renderHook(() => useComponentsBackfilled(), {
        wrapper: wrapper(),
      })

      await waitFor(() =>
        expect(result.current.error).toEqual({
          status: 403,
          data: {
            detail: (
              <p>
                Activation is required to view this repo, please{' '}
                <A
                  to={{ pageName: 'membersTab' }}
                  hook="activate-members"
                  isExternal={false}
                >
                  click here{' '}
                </A>{' '}
                to activate your account.
              </p>
            ),
          },
          dev: 'useComponentsBackfilled - 403 OwnerNotActivatedError',
        })
      )
    })
  })
})
