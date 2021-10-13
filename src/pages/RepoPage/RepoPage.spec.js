import { render, screen } from '@testing-library/react'
import { useLocation, Route, MemoryRouter } from 'react-router-dom'
import RepoPage from '.'
import { QueryClientProvider, QueryClient } from 'react-query'
import { useRepo } from 'services/repo/hooks'

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ provider: 'gh', owner: 'codecov', repo: 'test' }),
  useRouteMatch: () => ({
    path: '/:provider/:owner/:repo',
    url: '/gh/codecov/test',
  }),
  useLocation: jest.fn(),
}))

jest.mock('services/repo/hooks')

describe('RepoPage', () => {
  function setup(repo) {
    useRepo.mockReturnValue({ data: repo })

    const queryClient = new QueryClient()
    useLocation.mockReturnValue({ pathname: 'gh/codecov/test' })
    render(
      <MemoryRouter initialEntries={['/gh']}>
        <Route>
          <QueryClientProvider client={queryClient}>
            <RepoPage />
          </QueryClientProvider>
        </Route>
      </MemoryRouter>
    )
  }

  describe('when rendered', () => {
    beforeEach(() => {
      setup({
        private: false,
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
})
