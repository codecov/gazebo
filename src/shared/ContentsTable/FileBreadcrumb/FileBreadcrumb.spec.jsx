import { render, screen } from 'custom-testing-library'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter, Route } from 'react-router-dom'

import FileBreadcrumb from './FileBreadcrumb'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
})

describe('FileBreadcrumb', () => {
  function setup({ entries, path }) {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={entries}>
          <Route path={path}>
            <FileBreadcrumb />
          </Route>
        </MemoryRouter>
      </QueryClientProvider>
    )
  }

  describe('path is provided in route', () => {
    beforeEach(() => {
      setup({
        entries: ['/gh/owner/coolrepo/tree/main/src/tests'],
        path: '/:provider/:owner/:repo/tree/:branch/:path+',
      })
    })

    it('renders the breadcrumb', () => {
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
