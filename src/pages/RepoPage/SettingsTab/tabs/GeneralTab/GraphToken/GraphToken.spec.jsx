import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route } from 'react-router-dom'

import GraphToken from './GraphToken'

const queryClient = new QueryClient()

const wrapper = ({ children }) => (
  <MemoryRouter initialEntries={['/gh/codecov/codecov-client/settings']}>
    <QueryClientProvider client={queryClient}>
      <Route path="/:provider/:owner/:repo/settings">{children}</Route>
    </QueryClientProvider>
  </MemoryRouter>
)

describe('DefaultBranch', () => {
  describe('renders GraphToken component', () => {
    it('renders title', () => {
      render(<GraphToken graphToken="graph token" />, { wrapper })

      const title = screen.getByText(/Graphing token/)
      expect(title).toBeInTheDocument()
    })
    it('renders body', () => {
      render(<GraphToken graphToken="graph token" />, { wrapper })

      const p = screen.getByText(
        'Use token in API request to repository graphs'
      )
      expect(p).toBeInTheDocument()
    })
    it('renders token copy', () => {
      render(<GraphToken graphToken="graph token" />, { wrapper })

      expect(screen.getByText('graph token')).toBeInTheDocument()
    })
  })

  describe('render with no graph token', () => {
    it('renders null', () => {
      render(<GraphToken graphToken={null} />, { wrapper })

      expect(
        screen.queryByText(/Repository graphing token/)
      ).not.toBeInTheDocument()
    })
  })
})
