import { renderHook } from '@testing-library/react-hooks'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { QueryClient, QueryClientProvider } from 'react-query'

import { usePull } from './hooks'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
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

const pull = {
  pullId: 5,
  title: 'fix code',
  state: 'OPEN',
  updatestamp: '2021-03-03T17:54:07.727453',
  author: {
    username: 'landonorris',
  },
  head: {
    commitid: 'fc43199b07c52cf3d6c19b7cdb368f74387c38ab',
    totals: {
      coverage: 78.33,
    },
  },
  comparedTo: {
    commitid: '2d6c42fe217c61b007b2c17544a9d85840381857',
  },
  compareWithBase: {
    patchTotals: {
      coverage: 92.12,
    },
    changeWithParent: 38.94,
  },
}

const dataReturned = {
  owner: {
    repository: {
      pull,
    },
  },
}

const provider = 'gh'
const owner = 'codecov'
const repo = 'gazebo'

describe('usePull', () => {
  let hookData

  function setup() {
    server.use(
      graphql.query('Pull', (req, res, ctx) => {
        return res(ctx.status(200), ctx.data(dataReturned))
      })
    )

    hookData = renderHook(() => usePull({ provider, owner, repo }), {
      wrapper,
    })
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
        return hookData.waitFor(() => hookData.result.current.isSuccess)
      })

      it('returns the data', () => {
        expect(hookData.result.current.data).toEqual(pull)
      })
    })
  })
})
