import { setupServer } from 'msw/node'
import { renderHook } from '@testing-library/react-hooks'
import { QueryClient, QueryClientProvider } from 'react-query'
import { useRepo } from './hooks'
import { rest } from 'msw'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
})

const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
)

const server = setupServer()

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

const result = {
  activated: false,
  active: false,
  author: {
    avatarUrl: 'https://avatars0.githubusercontent.com/u/8226205?v=3&s=55',
    service: 'github',
    username: 'codecov',
    name: 'codecov',
    stats: {},
  },
  bot: null,
  branch: 'master',
  canEdit: true,
  canView: true,
  fork: null,
  hookid: null,
  imageToken: 'XQV51VID4C',
  language: 'python',
  latestCommit: null,
  name: 'codecov-circleci-orb',
  private: false,
  repoid: 17,
  serviceId: '157147600',
  updatestamp: '2021-10-11T15:56:18.422715Z',
  uploadToken: 'token',
  usingIntegration: false,
  yaml: null,
}

const provider = 'gh'
const owner = 'RulaKhaled'
const repo = 'test'
const query = ''
const opts = {
  suspense: false,
  staleTime: 0,
  keepPreviousData: false,
}

describe('getRepo', () => {
  let hookData

  function setup() {
    server.use(
      rest.get(`/internal/:provider/:owner/repos/:repo/`, (req, res, ctx) => {
        return res(ctx.status(200), ctx.json(result))
      })
    )

    hookData = renderHook(
      () => useRepo({ provider, owner, repo, query, opts }),
      {
        wrapper,
      }
    )
  }

  describe('when called', () => {
    beforeEach(() => {
      setup()
    })

    it('renders isLoading true', () => {
      expect(hookData.result.current.isLoading).toBeTruthy()
    })

    describe('when data is loaded', () => {
      beforeEach(() => {
        console.log('anything')
        return hookData.waitFor(() => hookData.result.current.isSuccess)
      })

      it('returns the data', () => {
        expect(hookData.result.current.data).toEqual(result)
      })
    })
  })
})
