import { render, screen } from '@testing-library/react'
import { Route, MemoryRouter } from 'react-router-dom'
import RepoPage from '.'

describe('RepoPage', () => {
  function setup() {
    render(
      <MemoryRouter initialEntries={['/gh/codecov/test']}>
        <Route path="/:provider/:owner/:repo">
          <RepoPage />
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
