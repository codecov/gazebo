import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PropsWithChildren, Suspense } from 'react'
import { MemoryRouter, Route, useLocation } from 'react-router-dom'

import TableHeader from './TableHeader'

const queryClient = new QueryClient({
  defaultOptions: { queries: { suspense: true, retry: false } },
})

let testLocation: ReturnType<typeof useLocation>
const wrapper: (initialEntries?: string) => React.FC<PropsWithChildren> =
  (initialEntries = '/gh/codecov/cool-repo/tests') =>
  ({ children }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialEntries]}>
        <Route
          path={[
            '/:provider/:owner/:repo/tests',
            '/:provider/:owner/:repo/tests/:branch',
          ]}
          exact
        >
          <Suspense fallback={null}>{children}</Suspense>
        </Route>
        <Route
          path="*"
          render={({ location }) => {
            testLocation = location
            return null
          }}
        />
      </MemoryRouter>
    </QueryClientProvider>
  )

describe('TableHeader', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the TableHeader component', () => {
    render(<TableHeader totalCount={50000} />, { wrapper: wrapper() })
    const testsText = screen.getByText('Tests (50.0K)')
    const searchInput = screen.getByPlaceholderText('Search by name')
    const resetButton = screen.getByText('Reset to default')

    expect(testsText).toBeInTheDocument()
    expect(searchInput).toBeInTheDocument()
    expect(resetButton).toBeInTheDocument()
  })

  it('updates search term on input change', async () => {
    render(<TableHeader totalCount={50000} />, { wrapper: wrapper() })
    const searchInput = screen.getByPlaceholderText('Search by name')
    await userEvent.type(searchInput, 'test')
    expect(searchInput).toHaveValue('test')
    await waitFor(() => {
      expect(testLocation.search).toContain('term=test')
    })
  })

  it('resets to default parameters on button click', async () => {
    render(<TableHeader totalCount={50000} />, {
      wrapper: wrapper('/gh/codecov/cool-repo/tests?term=test'),
    })
    const resetButton = screen.getByText('Reset to default')
    await userEvent.click(resetButton)
    await waitFor(() => {
      expect(testLocation.search).toBe('')
    })
  })

  it('disables reset button when parameters are default', () => {
    render(<TableHeader totalCount={50000} />, { wrapper: wrapper() })
    const resetButton = screen.getByText('Reset to default')
    expect(resetButton).toBeDisabled()
  })

  it('enables reset button when parameters are not default', () => {
    render(<TableHeader totalCount={50000} />, {
      wrapper: wrapper('/gh/codecov/cool-repo/tests?term=test'),
    })
    const resetButton = screen.getByText('Reset to default')
    expect(resetButton).not.toBeDisabled()
  })
})
