import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook } from '@testing-library/react-hooks'
import { rest } from 'msw'
import { setupServer } from 'msw/node'

import { useSunburstCoverage } from './index'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      suspense: true,
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

const exampleResponse = [
  {
    name: 'src',
    full_path: 'src',
    coverage: 97.89272030651341,
    lines: 6264,
    hits: 6132,
    partials: 0,
    misses: 132,
    children: [
      {
        name: 'App.jsx',
        full_path: 'src/App.jsx',
        coverage: 100,
        lines: 24,
        hits: 24,
        partials: 0,
        misses: 0,
      },
      {
        name: 'config.js',
        full_path: 'src/config.js',
        coverage: 100,
        lines: 13,
        hits: 13,
        partials: 0,
        misses: 0,
      },
    ],
  },
]

describe('useSunburstCoverage', () => {
  beforeEach(() => {
    server.use(
      rest.get(
        '/internal/:provider/:owner/:repo/coverage/tree',
        (req, res, ctx) => res(ctx.status(200), ctx.json(exampleResponse))
      )
    )
  })

  describe('returns sunburst data', () => {
    it('returns chart data', async () => {
      const { waitFor, result } = renderHook(
        () =>
          useSunburstCoverage({
            provider: 'github',
            owner: 'critical role',
            repo: 'c3',
            query: {},
          }),
        {
          wrapper,
        }
      )

      await waitFor(() => !result.current.isFetching)

      expect(result.current.data).toStrictEqual([
        {
          name: 'src',
          fullPath: 'src',
          coverage: 97.89272030651341,
          lines: 6264,
          hits: 6132,
          partials: 0,
          misses: 132,
          children: [
            {
              name: 'App.jsx',
              fullPath: 'src/App.jsx',
              coverage: 100,
              lines: 24,
              hits: 24,
              partials: 0,
              misses: 0,
            },
            {
              name: 'config.js',
              fullPath: 'src/config.js',
              coverage: 100,
              lines: 13,
              hits: 13,
              partials: 0,
              misses: 0,
            },
          ],
        },
      ])
    })
  })
})
