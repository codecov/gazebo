import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook } from '@testing-library/react-hooks'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'

import { useRepoOverview } from './useRepoOverview'

const queryClient = new QueryClient()

const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
)

const server = setupServer()

beforeAll(() => server.listen())
afterEach(() => {
  queryClient.clear()
  server.resetHandlers()
})
afterAll(() => server.close())

describe('useRepoOverview', () => {
  function setup(data) {
    server.use(
      graphql.query('GetRepoOverview', (req, res, ctx) => {
        return res(ctx.status(200), ctx.data(data))
      })
    )
  }

  describe('when called with successful res', () => {
    beforeEach(() => {
      setup({
        owner: {
          repository: {
            private: true,
            defaultBranch: 'main',
            oldestCommitAt: '2022-10-10T11:59:59',
          },
        },
      })
    })

    describe('when data is loaded', () => {
      it('returns the data', async () => {
        const { result, waitFor } = renderHook(
          () =>
            useRepoOverview({ provider: 'bb', owner: 'doggo', repo: 'woof' }),
          {
            wrapper,
          }
        )

        await waitFor(() =>
          expect(result.current.data).toStrictEqual({
            private: true,
            defaultBranch: 'main',
            oldestCommitAt: '2022-10-10T11:59:59',
          })
        )
      })
    })
  })

  describe('when called with unsuccessful res', () => {
    beforeEach(() => {
      setup({})
    })

    it('returns the data', async () => {
      const { result, waitFor } = renderHook(
        () => useRepoOverview({ provider: 'bb', owner: 'doggo', repo: 'woof' }),
        {
          wrapper,
        }
      )

      await waitFor(() => expect(result.current.data).toEqual({}))
    })
  })
})
