import { render, screen } from 'custom-testing-library'
import RepoTitleLink from './RepoTitleLink'
import { MemoryRouter, Route } from 'react-router-dom'

describe('RepoTitleLink', () => {
  let props

  const repo = {
    name: 'repo1',
    author: {
      username: 'owner1',
    },
    private: true,
  }

  function setup(over = {}) {
    props = {
      showRepoOwner: true,
      repo,
      ...over,
    }
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
      })
    })

    it('renders the title', () => {
      expect(screen.getByText(/repo1/)).toBeInTheDocument()
    })

    it('renders the private tag', () => {
      expect(screen.getByText(/Private/)).toBeInTheDocument()
    })
  })

  describe('when the repo is public', () => {
    beforeEach(() => {
      setup({
        repo: {
          ...repo,
          private: false,
        },
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
        showRepoOwner: true,
      })
    })

    it('renders the org name', () => {
      expect(screen.getByText(/owner1/)).toBeInTheDocument()
    })
  })

  describe('when showRepoOwner is false', () => {
    beforeEach(() => {
      setup({
        showRepoOwner: false,
      })
    })

    it('desont render the org name', () => {
      expect(screen.queryByText(/owner1/)).not.toBeInTheDocument()
    })
  })
})
