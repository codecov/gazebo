import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook } from '@testing-library/react-hooks'
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

    it('returns isLoading false', () => {
      const { result } = renderHook(() => useRegenerateRepoUploadToken(), {
        wrapper,
      })
      expect(result.current.isLoading).toBeFalsy()
    })

    describe('when calling the mutation', () => {
      it('returns isLoading true', async () => {
        const { result, waitFor } = renderHook(
          () => useRegenerateRepoUploadToken(),
          {
            wrapper,
          }
        )
        result.current.mutate()
        await waitFor(() => result.current.status !== 'idle')
        expect(result.current.isLoading).toBeTruthy()
      })
    })

    describe('When success', () => {
      it('returns isSuccess true', async () => {
        const { result } = renderHook(() => useRegenerateRepoUploadToken(), {
          wrapper,
        })

        result.current.mutate({})

        expect(result.current.isSuccess).toBeTruthy()
      })
    })
  })
})
