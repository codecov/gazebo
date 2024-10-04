import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route } from 'react-router-dom'

import FileBreadcrumb from './FileBreadcrumb'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
})

const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter initialEntries={['/gh/owner/coolrepo/tree/main/src/tests']}>
      <Route path="/:provider/:owner/:repo/tree/:branch/:path+">
        {children}
      </Route>
    </MemoryRouter>
  </QueryClientProvider>
)

describe('FileBreadcrumb', () => {
  describe('path is provided in route', () => {
    it('renders the breadcrumb', () => {
      render(<FileBreadcrumb />, { wrapper })

      const repo = screen.getByRole('link', { name: 'coolrepo' })
      expect(repo).toBeInTheDocument()
      expect(repo).toHaveAttribute('href', '/gh/owner/coolrepo/tree/main/')

      const src = screen.getByRole('link', { name: 'src' })
      expect(src).toBeInTheDocument()
      expect(src).toHaveAttribute('href', '/gh/owner/coolrepo/tree/main/src')

      const tests = screen.getByText('tests')
      expect(tests).toBeInTheDocument()
    })
  })
})
