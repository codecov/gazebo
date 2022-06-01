import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from 'react-query'
import { MemoryRouter, Route } from 'react-router-dom'

import GraphToken from './GrpahToken'

const queryClient = new QueryClient()

describe('DefaultBranch', () => {
  function setup() {
    render(
      <MemoryRouter initialEntries={['/gh/codecov/codecov-client/settings']}>
        <QueryClientProvider client={queryClient}>
          <Route path="/:provider/:owner/:repo/settings">
            <GraphToken graphToken="random" />
          </Route>
        </QueryClientProvider>
      </MemoryRouter>
    )
  }

  describe('renders GraphToken componenet', () => {
    beforeEach(() => {
      setup()
    })
    it('renders title', () => {
      const title = screen.getByText(/Repository graphing token/)
      expect(title).toBeInTheDocument()
    })
    it('renders body', () => {
      const p = screen.getByText('Token is used for viewing graphs')
      const p2 = screen.getByText(
        'Use this token in API request to repository graphs'
      )
      expect(p).toBeInTheDocument()
      expect(p2).toBeInTheDocument()
    })
    it('renders token copy', () => {
      expect(screen.getByText('random')).toBeInTheDocument()
    })
  })
})
