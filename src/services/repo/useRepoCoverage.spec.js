import { renderHook } from '@testing-library/react-hooks'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { QueryClient, QueryClientProvider } from 'react-query'

import { useRepoCoverage } from './useRepoCoverage'

const queryClient = new QueryClient()

const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
)

const server = setupServer()

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('useRepoCoverage', () => {
  let hookData

  function setup(data) {
    server.use(
      graphql.query('GetRepoCoverage', (req, res, ctx) => {
        return res(ctx.status(200), ctx.data(data))
      })
    )

    hookData = renderHook(
      () => useRepoCoverage({ provider: 'bb', owner: 'doggo', repo: 'woof' }),
      {
        wrapper,
      }
    )
  }

  describe('when called with successful res', () => {
    beforeEach(() => {
      setup({
        owner: {
          repository: {
            branch: {
              head: {
                totals: {
                  percentCovered: 70.44,
                },
              },
            },
          },
        },
      })
    })
    afterEach(() => server.resetHandlers())

    it('renders isLoading true', () => {
      expect(hookData.result.current.isLoading).toBeTruthy()
    })

    describe('when data is loaded', () => {
      beforeEach(() => {
        return hookData.waitFor(() => hookData.result.current.isSuccess)
      })

      it('returns the data', async () => {
        await hookData.waitFor(() =>
          expect(hookData.result.current.data).toEqual({
            head: {
              totals: {
                percentCovered: 70.44,
              },
            },
          })
        )
      })
    })
  })

  describe('when called with unsuccessful res', () => {
    beforeEach(() => {
      setup({})
    })
    afterEach(() => server.resetHandlers())

    it('returns the data', async () => {
      await hookData.waitFor(() =>
        expect(hookData.result.current.data).toEqual({})
      )
    })
  })
})
