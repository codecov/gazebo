import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import React, { PropsWithChildren } from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

import { useUpdateDefaultOrganization } from './useUpdateDefaultOrganization'

const server = setupServer()

beforeAll(() => server.listen())
afterEach(() => {
  server.resetHandlers()
  queryClient.clear()
})

afterAll(() => server.close())

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})

const wrapper: React.FC<PropsWithChildren> = ({ children }) => (
  <MemoryRouter initialEntries={['/gh/codecov']}>
    <Route path="/:provider/:owner/">
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </Route>
  </MemoryRouter>
)

describe('useUpdateDefaultOrganization', () => {
  function setup(data = {}, triggerError = false) {
    server.use(
      graphql.mutation('updateDefaultOrganization', (info) => {
        if (triggerError) {
          return HttpResponse.json({ data })
        } else {
          return HttpResponse.json({ data })
        }
      })
    )
  }

  describe('when called without an error', () => {
    beforeEach(() => {
      setup({ updateDefaultOrganization: { username: 'Gilmore' } })
    })

    it('returns isLoading false', () => {
      const { result } = renderHook(() => useUpdateDefaultOrganization(), {
        wrapper,
      })
      expect(result.current.isLoading).toBeFalsy()
    })

    describe('When mutation is a success', () => {
      it('returns successful response', async () => {
        const { result } = renderHook(() => useUpdateDefaultOrganization(), {
          wrapper,
        })
        result.current.mutate({ username: 'codecov' })
        const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries')

        await waitFor(() => expect(result.current.isSuccess).toBeTruthy())

        const username =
          result.current.data.data.updateDefaultOrganization.username
        await waitFor(() => expect(username).toBe('Gilmore'))

        expect(invalidateQueries).toHaveBeenCalledTimes(2)
        expect(invalidateQueries).toHaveBeenNthCalledWith(1, ['DetailOwner'])
        expect(invalidateQueries).toHaveBeenNthCalledWith(2, ['currentUser'])
      })
    })
  })

  describe('when called with a validation error', () => {
    const mockData = {
      updateDefaultOrganization: {
        error: {
          __typename: 'ValidationError',
        },
      },
    }
    beforeEach(() => {
      const triggerError = true
      setup(mockData, triggerError)
    })

    describe('When mutation is a success w/ a validation error', () => {
      it('returns isSuccess true', async () => {
        const { result } = renderHook(() => useUpdateDefaultOrganization(), {
          wrapper,
        })
        result.current.mutate({ username: 'random org!' })

        await waitFor(() =>
          expect(result.current.error).toEqual(
            new Error(
              'Organization does not belong in the current users organization list'
            )
          )
        )
      })
    })
  })
})
