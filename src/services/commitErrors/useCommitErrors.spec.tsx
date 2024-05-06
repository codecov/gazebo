import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql } from 'msw'
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
        yamlErrors: {
          edges: [{ node: { errorCode: 'invalid_yaml' } }],
        },
        botErrors: {
          edges: [{ node: { errorCode: 'repo_bot_invalid' } }],
        },
      },
    },
  },
}

const server = setupServer()

beforeAll(() => server.listen())
beforeEach(() => {
  server.resetHandlers()
  queryClient.clear()
})
afterAll(() => server.close())

describe('useCommitErrors', () => {
  function setup() {
    server.use(
      graphql.query(`CommitErrors`, (req, res, ctx) => {
        return res(ctx.status(200), ctx.data(dataReturned))
      })
    )
  }

  describe('when called and user is authenticated', () => {
    beforeEach(() => {
      setup()
    })

    it('returns commit info', async () => {
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
})
