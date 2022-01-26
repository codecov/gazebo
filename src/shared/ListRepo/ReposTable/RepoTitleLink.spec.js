import { render, screen } from 'custom-testing-library'
import RepoTitleLink from './RepoTitleLink'
import { MemoryRouter, Route } from 'react-router-dom'

describe('RepoTitleLink', () => {
  const repo = {
    name: 'repo1',
    author: {
      username: 'owner1',
    },
    private: true,
  }

  function setup(props) {
    render(
      <MemoryRouter initialEntries={['/gh']}>
        <Route path="/:provider">
          <RepoTitleLink {...props} />
        </Route>
      </MemoryRouter>
    )
  }

  describe('when the repository is private', () => {
    beforeEach(() => {
      setup({
        repo: {
          ...repo,
          private: true,
        },
        showRepoOwner: false,
        active: false,
        newRepoSetupLink: false,
      })
    })

    it('renders the title', () => {
      expect(screen.getByText(/repo1/)).toBeInTheDocument()
    })

    it('renders the private tag', () => {
      expect(screen.getByTestId('private repo icon')).toBeInTheDocument()
    })
  })

  describe('when the repo is public', () => {
    beforeEach(() => {
      setup({
        repo: {
          ...repo,
          private: false,
        },
        showRepoOwner: false,
        active: false,
        newRepoSetupLink: false,
      })
    })

    it('renders the title', () => {
      expect(screen.getByText(/repo1/)).toBeInTheDocument()
    })

    it('doesnt render the private tag', () => {
      expect(screen.queryByText(/Private/)).not.toBeInTheDocument()
    })
  })

  describe('when showRepoOwner is true', () => {
    beforeEach(() => {
      setup({
        repo,
        showRepoOwner: true,
        active: false,
        newRepoSetupLink: false,
      })
    })

    it('renders the org name', () => {
      expect(screen.getByText(/owner1/)).toBeInTheDocument()
    })
  })

  describe('when showRepoOwner is false', () => {
    beforeEach(() => {
      setup({
        repo,
        showRepoOwner: false,
        active: false,
        newRepoSetupLink: false,
      })
    })

    it('desont render the org name', () => {
      expect(screen.queryByText(/owner1/)).not.toBeInTheDocument()
    })
  })
})
