import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from 'react-query'
import { MemoryRouter, Route } from 'react-router-dom'

import Badges from './Badges'

const queryClient = new QueryClient()

describe('Badges', () => {
  function setup() {
    render(
      <MemoryRouter
        initialEntries={['/gh/codecov/codecov-client/settings/badge']}
      >
        <QueryClientProvider client={queryClient}>
          <Route path="/:provider/:owner/:repo/settings/badge">
            <Badges graphToken="WIO9JXFGE" defaultBranch="master" />
          </Route>
        </QueryClientProvider>
      </MemoryRouter>
    )
  }

  describe('renders Badges componenet', () => {
    beforeEach(() => {
      setup()
    })
    it('renders title', () => {
      const title = screen.getByText(/Codecov badge/)
      expect(title).toBeInTheDocument()
    })
    it('renders body', () => {
      const p = screen.getByText(
        /A live icon that you can embed in code, such as in a README.md, to provide quick insight into your project's code coverage percentage./
      )
      expect(p).toBeInTheDocument()
    })
    it('renders tokens', () => {
      expect(screen.getByText('Markdown')).toBeInTheDocument()
      expect(screen.getByText('HTML')).toBeInTheDocument()
      expect(screen.getByText('RST')).toBeInTheDocument()
    })
  })
})
