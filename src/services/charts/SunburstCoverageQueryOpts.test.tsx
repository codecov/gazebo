import {
  QueryClientProvider as QueryClientProviderV5,
  QueryClient as QueryClientV5,
  useQuery as useQueryV5,
} from '@tanstack/react-queryV5'
import { renderHook, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import { SunburstCoverageQueryOpts } from './SunburstCoverageQueryOpts'

const queryClientV5 = new QueryClientV5({
  defaultOptions: { queries: { retry: false } },
})

const wrapper =
  (initialEntries = '/gh'): React.FC<React.PropsWithChildren> =>
  ({ children }) => (
    <QueryClientProviderV5 client={queryClientV5}>
      <MemoryRouter initialEntries={[initialEntries]}>
        <Route path="/:provider">{children}</Route>
      </MemoryRouter>
    </QueryClientProviderV5>
  )

const server = setupServer()
beforeAll(() => {
  server.listen()
})

afterEach(() => {
  server.resetHandlers()
  queryClientV5.clear()
})

afterAll(() => {
  server.close()
})

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

const filteredResponse = [
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
    ],
  },
]

describe('useSunburstCoverage', () => {
  beforeEach(() => {
    server.use(
      http.get('/internal/:provider/:owner/:repo/coverage/tree', (info) => {
        const searchParams = new URL(info.request.url).searchParams
        const flags = searchParams.getAll('flags')
        const components = searchParams.getAll('components')

        if (flags.length > 0 || components.length > 0) {
          return HttpResponse.json(filteredResponse)
        } else {
          return HttpResponse.json(exampleResponse)
        }
      })
    )
  })

  describe('returns sunburst data', () => {
    it('returns chart data', async () => {
      const { result } = renderHook(
        () =>
          useQueryV5(
            SunburstCoverageQueryOpts({
              provider: 'github',
              owner: 'critical role',
              repo: 'c3',
              query: {},
            })
          ),
        { wrapper: wrapper() }
      )

      await waitFor(() => !result.current.isFetching)

      await waitFor(() =>
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
      )
    })
  })

  describe('with flags and components filters', () => {
    it('returns filtered data', async () => {
      const { result } = renderHook(
        () =>
          useQueryV5(
            SunburstCoverageQueryOpts({
              provider: 'github',
              owner: 'critical role',
              repo: 'c3',
              query: {
                flags: ['flag1', 'flag2'],
                components: ['c1'],
              },
            })
          ),
        { wrapper: wrapper() }
      )

      await waitFor(() => !result.current.isFetching)

      await waitFor(() =>
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
            ],
          },
        ])
      )
    })
  })
})
