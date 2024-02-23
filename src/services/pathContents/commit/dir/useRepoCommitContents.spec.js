import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import { useRepoCommitContents } from './useRepoCommitContents'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})
const server = setupServer()

const mockData = {
  owner: {
    repository: {
      repositoryConfig: {
        indicationRange: {
          upperRange: 80,
          lowerRange: 60,
        },
      },
      commit: {
        pathContents: {
          __typename: 'PathContents',
          results: [
            {
              name: 'file.ts',
              filePath: null,
              percentCovered: 50.0,
              type: 'file',
            },
          ],
        },
      },
    },
  },
}

const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter initialEntries={['/gh/codecov/test']}>
      <Route path="/:provider/:owner/:repo">{children}</Route>
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

describe('useRepoCommitContents', () => {
  function setup() {
    server.use(
      graphql.query('CommitPathContents', (req, res, ctx) =>
        res(ctx.status(200), ctx.data(mockData))
      )
    )
  }

  describe('when called', () => {
    beforeEach(() => {
      setup()
    })

    it('sets isLoading to true', () => {
      const { result } = renderHook(
        () =>
          useRepoCommitContents({
            provider: 'gh',
            owner: 'codecov',
            repo: 'test',
            commit: 'commit-1234',
            path: '',
          }),
        { wrapper }
      )

      expect(result.current.isLoading).toBe(true)
    })

    it('returns path contents', async () => {
      const { result } = renderHook(
        () =>
          useRepoCommitContents({
            provider: 'gh',
            owner: 'codecov',
            repo: 'test',
            commit: 'commit-1234',
            path: '',
          }),
        { wrapper }
      )

      await waitFor(() => result.current.isLoading)
      await waitFor(() => !result.current.isLoading)

      const expectedData = {
        results: [
          {
            filePath: null,
            name: 'file.ts',
            percentCovered: 50,
            type: 'file',
          },
        ],
        indicationRange: {
          upperRange: 80,
          lowerRange: 60,
        },
      }

      await waitFor(() =>
        expect(result.current.data).toStrictEqual(expectedData)
      )
    })
  })
})
