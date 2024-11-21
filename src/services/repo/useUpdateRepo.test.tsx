import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import { useUpdateRepo } from './index'

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

describe('useUpdateRepo', () => {
  function setup() {
    server.use(
      http.patch(`internal/github/codecov/repos/test/`, () => {
        return HttpResponse.json(repoDetails)
      })
    )
  }

  describe('when called', () => {
    describe('When success', () => {
      it('returns isSuccess true', async () => {
        setup()
        const { result } = renderHook(() => useUpdateRepo(), {
          wrapper: wrapper(),
        })

        result.current.mutate()

        await waitFor(() => expect(result.current.isSuccess).toBeTruthy())
      })
    })
  })
})
