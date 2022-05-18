import { act, renderHook } from '@testing-library/react-hooks'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { QueryClient, QueryClientProvider } from 'react-query'

import { useRegenerateUploadToken } from './hooks'

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

const queryClient = new QueryClient()
const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
)

describe('useRegenerateUploadToken', () => {
  let hookData

  function setup({ provider, owner, repo }) {
    server.use(
      rest.patch(
        `/${provider}/${owner}/repos/${repo}/regenerate-upload-token/`,
        (req, res, ctx) => {
          return res(ctx.status(200), ctx.json(repoDetails))
        }
      )
    )
    hookData = renderHook(
      () => useRegenerateUploadToken({ provider, owner, repo }),
      {
        wrapper,
      }
    )
  }

  describe('when called', () => {
    beforeEach(() => {
      setup({ provider: 'gh', owner: 'codecov', repo: 'gazebo' })
    })

    it('returns isLoading false', () => {
      expect(hookData.result.current.isLoading).toBeFalsy()
    })

    describe('when calling the mutation', () => {
      beforeEach(() => {
        return act(() => {
          hookData.result.current.mutate()
          return hookData.waitFor(
            () => hookData.result.current.status !== 'idle'
          )
        })
      })

      it('returns isLoading true', () => {
        expect(hookData.result.current.isLoading).toBeTruthy()
      })
    })
  })
})
