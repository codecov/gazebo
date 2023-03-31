import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route } from 'react-router-dom'

import UnsupportedView from './UnsupportedView'

const queryClient = new QueryClient()

const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter
      initialEntries={[
        '/gh/critical-role/bells-hells/blob/main/folder/file.png',
      ]}
    >
      <Route path="/:provider/:owner/:repo/blob/:branch/:path+">
        {children}
      </Route>
    </MemoryRouter>
  </QueryClientProvider>
)

describe('UnsupportedView', () => {
  describe('when there is no flags data', () => {
    it('renders title', () => {
      render(<UnsupportedView />, { wrapper })
      const repo = screen.getByText(/bells-hells/)
      expect(repo).toBeInTheDocument()

      const path = screen.getByText(/folder/)
      expect(path).toBeInTheDocument()

      const filename = screen.getByText(/file.png/)
      expect(filename).toBeInTheDocument()

      const binaryFileHeading = screen.getByText('Binary file')
      expect(binaryFileHeading).toBeInTheDocument()
    })
  })
})
