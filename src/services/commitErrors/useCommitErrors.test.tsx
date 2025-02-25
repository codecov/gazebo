import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import React from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

import { useCommitErrors } from './useCommitErrors'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
})
const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <MemoryRouter initialEntries={['/gh/codecov/codecov-exe/commit/9']}>
    <Route path="/:provider/:owner/:repo/commit/:commit">
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </Route>
  </MemoryRouter>
)

const dataReturned = {
  owner: {
    repository: {
      __typename: 'Repository',
      commit: {
        yamlErrors: { edges: [{ node: { errorCode: 'invalid_yaml' } }] },
        botErrors: { edges: [{ node: { errorCode: 'repo_bot_invalid' } }] },
      },
    },
  },
}

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

const mockUnsuccessfulParseError = {}

const server = setupServer()

beforeAll(() => server.listen())
beforeEach(() => {
  server.resetHandlers()
  queryClient.clear()
})
afterAll(() => server.close())

describe('useCommitErrors', () => {
  function setup({
    isNotFoundError = false,
    isOwnerNotActivatedError = false,
    isUnsuccessfulParseError = false,
  }) {
    server.use(
      graphql.query(`CommitErrors`, () => {
        if (isNotFoundError) {
          return HttpResponse.json({ data: mockNotFoundError })
        } else if (isOwnerNotActivatedError) {
          return HttpResponse.json({ data: mockOwnerNotActivatedError })
        } else if (isUnsuccessfulParseError) {
          return HttpResponse.json({ data: mockUnsuccessfulParseError })
        } else {
          return HttpResponse.json({ data: dataReturned })
        }
      })
    )
  }

  describe('when called and user is authenticated', () => {
    it('returns commit info', async () => {
      setup({})
      const { result } = renderHook(() => useCommitErrors(), {
        wrapper,
      })

      await waitFor(() => result.current.isSuccess)

      await waitFor(() =>
        expect(result.current.data).toEqual({
          botErrors: [{ errorCode: 'repo_bot_invalid' }],
          yamlErrors: [{ errorCode: 'invalid_yaml' }],
        })
      )
    })
  })
  describe('when called but repository errors', () => {
    beforeAll(() => {
      vi.spyOn(console, 'error').mockImplementation(() => {})
    })

    afterAll(() => {
      vi.restoreAllMocks()
    })

    it('can return unsuccessful parse error', async () => {
      setup({ isUnsuccessfulParseError: true })
      const { result } = renderHook(() => useCommitErrors(), {
        wrapper,
      })

      await waitFor(() => expect(result.current.isError).toBeTruthy())
      await waitFor(() =>
        expect(result.current.error).toEqual(
          expect.objectContaining({
            dev: 'useCommitErrors - Parsing Error',
            status: 400,
          })
        )
      )
    })

    it('can return not found error', async () => {
      setup({ isNotFoundError: true })
      const { result } = renderHook(() => useCommitErrors(), {
        wrapper,
      })

      await waitFor(() => expect(result.current.isError).toBeTruthy())
      await waitFor(() =>
        expect(result.current.error).toEqual(
          expect.objectContaining({
            dev: 'useCommitErrors - Not Found Error',
            status: 404,
          })
        )
      )
    })

    it('can return owner not activated error', async () => {
      setup({ isOwnerNotActivatedError: true })
      const { result } = renderHook(() => useCommitErrors(), {
        wrapper,
      })

      await waitFor(() => expect(result.current.isError).toBeTruthy())
      await waitFor(() =>
        expect(result.current.error).toEqual(
          expect.objectContaining({
            dev: 'useCommitErrors - Owner Not Activated',
            status: 403,
          })
        )
      )
    })
  })
})
