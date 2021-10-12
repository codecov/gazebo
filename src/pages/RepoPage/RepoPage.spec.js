import { render, screen } from '@testing-library/react'
import { useLocation, Route, MemoryRouter } from 'react-router-dom'
import RepoPage from '.'
import { QueryClientProvider, QueryClient } from 'react-query'

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ provider: 'gh', owner: 'codecov', repo: 'test' }),
  useRouteMatch: () => ({
    path: '/:provider/:owner/:repo',
    url: '/gh/codecov/test',
  }),
  useLocation: jest.fn(),
}))

describe('RepoPage', () => {
  function setup() {
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
      setup()
    })

    it('renders the title with the owner name', () => {
      const owner = screen.getByText(/codecov/)
      expect(owner).toBeInTheDocument()
    })

    it('renders the title with the repo name', () => {
      const repo = screen.getByText(/test/)
      expect(repo).toBeInTheDocument()
    })
  })
})
