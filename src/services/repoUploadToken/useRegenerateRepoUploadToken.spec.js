import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import { useRegenerateRepoUploadToken } from './useRegenerateRepoUploadToken'

const repoDetails = {
  can_edit: true,
  can_view: true,
  latest_commit: {
    report: {
      files: [
        {
          name: 'src/App.js',
          totals: {
            files: 0,
            lines: 13,
            hits: 13,
            misses: 0,
            partials: 0,
            coverage: 100.0,
            branches: 0,
            methods: 10,
            sessions: 0,
            complexity: 0.0,
            complexity_total: 0.0,
            complexity_ratio: 0,
            diff: null,
          },
        },
      ],
      uploadToken: 'random',
    },
  },
}

const server = setupServer()

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})
const wrapper = ({ children }) => (
  <MemoryRouter initialEntries={['/gh/codecov/gazebo']}>
    <Route path="/:provider/:owner/:repo">
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </Route>
  </MemoryRouter>
)

describe('useRegenerateRepoUploadToken', () => {
  function setup() {
    server.use(
      rest.patch(
        `internal/github/codecov/repos/gazebo/regenerate-upload-token/`,
        (req, res, ctx) => {
          return res(ctx.status(200), ctx.json(repoDetails))
        }
      )
    )
  }

  describe('when called', () => {
    beforeEach(() => {
      setup()
    })

    describe('when calling the mutation', () => {
      describe('when successful', () => {
        it('returns isSuccess true', async () => {
          const { result } = renderHook(() => useRegenerateRepoUploadToken(), {
            wrapper,
          })

          result.current.mutate()

          await waitFor(() => result.current.isLoading)
          await waitFor(() => !result.current.isLoading)

          await waitFor(() => expect(result.current.isSuccess).toBeTruthy())
        })
      })
    })
  })
})
