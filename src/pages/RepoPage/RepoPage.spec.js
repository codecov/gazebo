import { render, screen } from '@testing-library/react'
import { useLocation, Route, MemoryRouter } from 'react-router-dom'
import RepoPage from '.'

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
    useLocation.mockReturnValue({ pathname: 'gh/codecov/test' })
    render(
      <MemoryRouter initialEntries={['/gh']}>
        <Route>
          <RepoPage />
        </Route>
      </MemoryRouter>
    )
  }

  describe('when rendered with a repo and an owner', () => {
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

    it('renders with overview tab', () => {
      const tab = screen.getByText(/Overview/)
      expect(tab).toBeInTheDocument()
    })

    it('renders with settings tab', () => {
      const tab = screen.getByText(/Settings/)
      expect(tab).toBeInTheDocument()
    })
  })
})
