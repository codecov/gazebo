import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { PropsWithChildren, Suspense } from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

import FailedTestsPage from './FailedTestsPage'

jest.mock('./SelectorSection/SelectorSection', () => () => 'Selector Section')
jest.mock('./MetricsSection/MetricsSection', () => () => 'Metrics Section')
jest.mock(
  './FailedTestsTable/FailedTestsTable',
  () => () => 'Failed Tests Table'
)

const server = setupServer()
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      suspense: false,
    },
  },
})

const wrapper: (initialEntries?: string) => React.FC<PropsWithChildren> =
  (initialEntries = '/gh/codecov/cool-repo/tests') =>
  ({ children }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialEntries]}>
        <Route
          path={[
            '/:provider/:owner/:repo/tests',
            '/:provider/:owner/:repo/tests/new',
            '/:provider/:owner/:repo/tests/new/codecov-cli',
            '/:provider/:owner/:repo/tests/:branch',
          ]}
          exact
        >
          <Suspense fallback={null}>{children}</Suspense>
        </Route>
      </MemoryRouter>
    </QueryClientProvider>
  )

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

describe('FailedTestsPage', () => {
  function setup() {
    server.use(
      graphql.query('GetRepoOverview', (req, res, ctx) => {
        return res(ctx.status(200), ctx.data({}))
      })
    )
  }

  it('renders sub-components', () => {
    setup()
    render(<FailedTestsPage />, { wrapper: wrapper() })

    const selectorSection = screen.getByText(/Selector Section/)
    const metricSection = screen.getByText(/Metrics Section/)
    const table = screen.getByText(/Failed Tests Table/)
    expect(selectorSection).toBeInTheDocument()
    expect(metricSection).toBeInTheDocument()
    expect(table).toBeInTheDocument()
  })
})
