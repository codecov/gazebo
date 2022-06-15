import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from 'react-query'
import { MemoryRouter, Route } from 'react-router-dom'

import Graphs from './Graphs'

const queryClient = new QueryClient()

describe('Graphs', () => {
  function setup() {
    render(
      <MemoryRouter
        initialEntries={['/gh/codecov/codecov-client/settings/badge']}
      >
        <QueryClientProvider client={queryClient}>
          <Route path="/:provider/:owner/:repo/settings/badge">
            <Graphs graphToken="WIO9JXFGE" defaultBranch="master" />
          </Route>
        </QueryClientProvider>
      </MemoryRouter>
    )
  }

  describe('renders Graphs component', () => {
    beforeEach(() => {
      setup()
    })
    it('renders title', () => {
      const title = screen.getByText(/Graphs/)
      expect(title).toBeInTheDocument()
    })
    it('renders Embed via API component', () => {
      const p = screen.getByText(
        /Use this token to view graphs and images for third party dashboard usage./
      )
      expect(p).toBeInTheDocument()
      expect(screen.getAllByText(/WIO9JXFGE/)[0]).toBeInTheDocument()
    })
    it('renders Embed via URL component', () => {
      const p = screen.getByText(
        /Use the URL of the svg to embed a graph of your repository page./
      )
      expect(p).toBeInTheDocument()
    })

    it('renders three different graphs cards', () => {
      expect(screen.getByText(/Sunburst/)).toBeInTheDocument()
      expect(
        screen.getByText(/The inner-most circle is the entire/)
      ).toBeInTheDocument()

      expect(screen.getByText(/Grid/)).toBeInTheDocument()
      expect(
        screen.getByText(/Each block represents a single/)
      ).toBeInTheDocument()

      expect(screen.getByText(/Icicle/)).toBeInTheDocument()
      expect(
        screen.getByText(/The top section represents the entire/)
      ).toBeInTheDocument()
    })
  })
})
