import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'
import { type MockInstance } from 'vitest'

import { useRepoComponentsSelect } from './useRepoComponentsSelect'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
})

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <MemoryRouter initialEntries={['/gh/codecov/gazebo/flags']}>
    <Route path="/:provider/:owner/:repo/flags">
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
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
        componentsYaml: [
          { name: 'foo', id: '1' },
          { name: 'bar', id: '2' },
        ],
      },
    },
  },
}

describe('RepoComponentsYamlSelector', () => {
  function setup({
    isSchemaInvalid = false,
    isOwnerActivationError = false,
    isNotFoundError = false,
  } = {}) {
    server.use(
      graphql.query('RepoComponentsSelector', () => {
        if (isSchemaInvalid) {
          return HttpResponse.json({})
        }

        if (isOwnerActivationError) {
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
        }

        if (isNotFoundError) {
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
        }

        return HttpResponse.json({ data: dataReturned })
      })
    )
  }

  describe('when called', () => {
    describe('when data is loaded', () => {
      it('returns the data', async () => {
        setup()
        const { result } = renderHook(
          () =>
            useRepoComponentsSelect({
              termId: 'foo',
            }),
          {
            wrapper,
          }
        )

        await waitFor(() =>
          expect(result.current.data).toEqual({
            components:
              dataReturned.owner.repository.coverageAnalytics.componentsYaml,
          })
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
      setup({ isSchemaInvalid: true })
      const { result } = renderHook(() => useRepoComponentsSelect(), {
        wrapper,
      })

      await waitFor(() =>
        expect(result.current.error).toEqual(
          expect.objectContaining({
            dev: 'useRepoComponentsSelect - Parsing Error',
            status: 400,
          })
        )
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

    it('returns an error', async () => {
      setup({ isNotFoundError: true })
      const { result } = renderHook(() => useRepoComponentsSelect(), {
        wrapper,
      })

      await waitFor(() =>
        expect(result.current.error).toEqual(
          expect.objectContaining({
            dev: 'useRepoComponentsSelect - Not Found Error',
            status: 404,
          })
        )
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

    it('returns an error', async () => {
      setup({ isOwnerActivationError: true })
      const { result } = renderHook(() => useRepoComponentsSelect(), {
        wrapper,
      })

      await waitFor(() =>
        expect(result.current.error).toEqual(
          expect.objectContaining({
            dev: 'useRepoComponentsSelect - Owner Not Activated',
            status: 403,
          })
        )
      )
    })
  })
})
