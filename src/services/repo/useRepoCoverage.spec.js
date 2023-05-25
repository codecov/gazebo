import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'

import { useRepoCoverage } from './useRepoCoverage'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})

const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
)

const server = setupServer()

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('useRepoCoverage', () => {
  function setup(data) {
    server.use(
      graphql.query('GetRepoCoverage', (req, res, ctx) => {
        return res(ctx.status(200), ctx.data(data))
      })
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
                  lineCount: 90,
                  hitsCount: 80,
                },
              },
            },
          },
        },
      })
    })
    afterEach(() => server.resetHandlers())

    describe('when data is loaded', () => {
      it('returns the data', async () => {
        const { result } = renderHook(
          () =>
            useRepoCoverage({ provider: 'bb', owner: 'doggo', repo: 'woof' }),
          {
            wrapper,
          }
        )

        await waitFor(() => result.current.isLoading)
        await waitFor(() => !result.current.isLoading)

        await waitFor(() =>
          expect(result.current.data).toEqual({
            head: {
              totals: {
                percentCovered: 70.44,
                lineCount: 90,
                hitsCount: 80,
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
      const { result } = renderHook(
        () => useRepoCoverage({ provider: 'bb', owner: 'doggo', repo: 'woof' }),
        {
          wrapper,
        }
      )

      await waitFor(() => expect(result.current.data).toEqual({}))
    })
  })
})
