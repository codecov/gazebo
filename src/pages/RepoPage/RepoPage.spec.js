import { render, screen } from '@testing-library/react'
import { Route, MemoryRouter } from 'react-router-dom'
import RepoPage from '.'
import { QueryClientProvider, QueryClient } from 'react-query'
import { useRepo } from 'services/repo/hooks'

jest.mock('services/repo/hooks')

describe('RepoPage', () => {
  function setup(repo, isLoading = false) {
    useRepo.mockReturnValue({ data: repo, isLoading })
    const queryClient = new QueryClient()
    render(
      <MemoryRouter initialEntries={['/gh/codecov/test']}>
        <Route path="/:provider/:owner/:repo">
          <QueryClientProvider client={queryClient}>
            <RepoPage />
          </QueryClientProvider>
        </Route>
      </MemoryRouter>
    )
  }

  describe('when rendered', () => {
    beforeEach(() => {
      setup({ private: false })
    })

    it('renders the title with the owner name', () => {
      const owner = screen.getByText(/codecov/)
      expect(owner).toBeInTheDocument()
    })

    it('renders the title with the repo name', () => {
      const repo = screen.getByText(/test/)
      expect(repo).toBeInTheDocument()
    })

    it('does not render Private span', () => {
      const privateSpan = screen.queryByText(/Private/)
      expect(privateSpan).not.toBeInTheDocument()
    })
  })

  describe('when rendered with private repo', () => {
    beforeEach(() => {
      setup({
        private: true,
      })
    })

    it('renders the title with the owner name', () => {
      const owner = screen.getByText(/codecov/)
      expect(owner).toBeInTheDocument()
    })

    it('renders the title with the repo name', () => {
      const repo = screen.getByText(/test/)
      expect(repo).toBeInTheDocument()
    })

    it('renders the block private', () => {
      const owner = screen.getByText(/Private/)
      expect(owner).toBeInTheDocument()
    })
  })

  describe('when rendered with is loading set to true', () => {
    beforeEach(() => {
      setup(
        {
          private: true,
        },
        true
      )
    })

    it('renders the spinner', () => {
      expect(screen.getByTestId('spinner')).toBeInTheDocument()
    })

    it('does not render the repo name', () => {
      const repo = screen.queryByText(/test/)
      expect(repo).not.toBeInTheDocument()
    })
  })
})
