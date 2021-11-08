import { render, screen } from '@testing-library/react'
import { Route, MemoryRouter } from 'react-router-dom'
import RepoPage from '.'
import { QueryClientProvider, QueryClient } from 'react-query'
import { useRepo } from 'services/repo/hooks'

jest.mock('services/repo/hooks')

describe('RepoPage', () => {
  function setup(repo) {
    useRepo.mockReturnValue({ data: repo })
    const queryClient = new QueryClient()
    render(
      <MemoryRouter initialEntries={['/gh/codecov/Test/new']}>
        <Route path="/:provider/:owner/:repo/new">
          <QueryClientProvider client={queryClient}>
            <RepoPage />
          </QueryClientProvider>
        </Route>
      </MemoryRouter>
    )
  }

  describe('when rendered', () => {
    beforeEach(() => {
      setup({ repo: { private: false } })
    })

    it('renders the title with the owner name', () => {
      const owner = screen.getByText(/codecov/)
      expect(owner).toBeInTheDocument()
    })

    it('renders the title with the repo name', () => {
      const repo = screen.getByText(/Test/)
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
        repo: {
          private: true,
        },
      })
    })

    it('renders the title with the owner name', () => {
      const owner = screen.getByText(/codecov/)
      expect(owner).toBeInTheDocument()
    })

    it('renders the title with the repo name', () => {
      const repo = screen.getByText(/Test/)
      expect(repo).toBeInTheDocument()
    })

    it('renders the block private', () => {
      const privateSpan = screen.getByText(/Private/)
      expect(privateSpan).toBeInTheDocument()
    })
  })

  describe('when rendered with null data', () => {
    beforeEach(() => {
      setup(null)
    })

    it('renders the 404 error', () => {
      const err = screen.getByText(/404 error/)
      expect(err).toBeInTheDocument()
    })

    it('renders the erorr text', () => {
      const err = screen.getByText(/We can't find what you're looking for/)
      expect(err).toBeInTheDocument()
    })
  })
})
