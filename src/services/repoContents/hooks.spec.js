import { renderHook } from '@testing-library/react-hooks'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { QueryClient, QueryClientProvider } from 'react-query'

import { useRepoContents } from './hooks'

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

const dataReturned = {
  owner: {
    username: 'Rabee-AbuBaker',
    repository: {
      branch: {
        head: {
          pathContents: [
            {
              name: 'flag1',
              filePath: null,
              percentCovered: 100.0,
              type: 'dir',
            },
          ],
        },
      },
    },
  },
}

const provider = 'gh'
const owner = 'Rabee-AbuBaker'
const repo = 'another-test'
const branch = 'main'
const path = ''

describe('BranchFiles', () => {
  let hookData

  function setup() {
    server.use(
      graphql.query('BranchFiles', (req, res, ctx) => {
        return res(ctx.status(200), ctx.data(dataReturned))
      })
    )

    hookData = renderHook(
      () =>
        useRepoContents({
          provider,
          owner,
          repo,
          branch,
          path,
        }),
      {
        wrapper,
      }
    )
  }

  describe('when called', () => {
    const expectedResponse = [
      {
        name: 'flag1',
        filePath: null,
        percentCovered: 100.0,
        type: 'dir',
      },
    ]

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
        expect(hookData.result.current.data).toEqual(expectedResponse)
      })
    })
  })
})
