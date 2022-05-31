import { render, screen, waitFor, within } from '@testing-library/react'
import user from '@testing-library/user-event'
import { MemoryRouter, Route } from 'react-router-dom'

import { useRepos } from 'services/repos'

import RepositoriesList from './RepositoriesList'

jest.mock('services/repos')

const reposData = {
  repos: [
    {
      name: 'opentelem-ruby',
      active: false,
      private: false,
      coverage: null,
      updatedAt: null,
      latestCommitAt: null,
      author: { username: 'codecov' },
    },
    {
      name: 'impact-analysis',
      active: false,
      private: true,
      coverage: null,
      updatedAt: null,
      latestCommitAt: null,
      author: { username: 'codecov' },
    },
    {
      name: 'codecov-gateway',
      active: false,
      private: true,
      coverage: null,
      updatedAt: null,
      latestCommitAt: null,
      author: { username: 'codecov' },
    },
  ],
}

const selectedOrg = {
  username: 'codecov',
  avatarUrl: 'https://avatars0.githubusercontent.com/u/8226205?v=3&s=55',
}

const selectedRepo = {
  name: 'opentelem-ruby',
  active: false,
  private: false,
  coverage: null,
  updatedAt: null,
  latestCommitAt: null,
  author: { username: 'codecov' },
}

describe('RepositoriesList', () => {
  let container
  let onSubmit = jest.fn()
  let fetchNextPage = jest.fn()

  function setup({ repos, hasNextPage, isLoading }) {
    useRepos.mockReturnValue({
      data: repos,
      fetchNextPage: fetchNextPage,
      hasNextPage: hasNextPage,
      isFetchingNextPage: false,
      isLoading: isLoading,
    })(
      ({ container } = render(
        <MemoryRouter initialEntries={['/gh']}>
          <Route path="/:provider">
            <RepositoriesList onSubmit={onSubmit} organization={selectedOrg} />
          </Route>
        </MemoryRouter>
      ))
    )
  }

  describe('when data is loading', () => {
    beforeEach(() => {
      setup({ repos: [], hasNextPage: false, isLoading: true })
    })

    it('renders a loading spinner', () => {
      expect(container).toBeInTheDocument()
      expect(screen.getByTestId('spinner')).toBeInTheDocument()
    })
  })
  describe('when data is available', () => {
    beforeEach(() => {
      setup({ repos: reposData, hasNextPage: true, isLoading: false })
    })

    it('renders repos list', () => {
      expect(container).toBeInTheDocument()
      expect(screen.getByText('opentelem-ruby')).toBeInTheDocument()
    })

    it('displays corresponding icon according to repo privacy', () => {
      const publicRepoContainer = screen.getByTestId('opentelem-ruby-container')
      expect(publicRepoContainer).toBeInTheDocument()
      const publicChild = within(publicRepoContainer).getByText('globe-alt.svg')
      expect(publicChild).toBeInTheDocument()

      const privateRepoContainer = screen.getByTestId(
        'impact-analysis-container'
      )
      expect(privateRepoContainer).toBeInTheDocument()
      const privateChild =
        within(privateRepoContainer).getByText('lock-closed.svg')
      expect(privateChild).toBeInTheDocument()
    })

    describe('when hasNextPage is true', () => {
      it('renders load more button', () => {
        const button = screen.getByText(/Load More/)
        expect(button).toBeInTheDocument()
      })
      it('fires next page button click', () => {
        const button = screen.getByText(/Load More/)
        button.click()
        expect(fetchNextPage).toHaveBeenCalled()
      })
    })
  })

  describe('when hasNextPage is false', () => {
    beforeEach(() => {
      setup({ repos: { repos: [] }, hasNextPage: false, isLoading: false })
    })

    it('doess not render load more button', () => {
      expect(screen.queryByText(/Load More/)).not.toBeInTheDocument()
    })
  })

  describe('when user selects a repo', () => {
    beforeEach(() => {
      setup({ repos: reposData, hasNextPage: true, isLoading: false })
      const repo = screen.getByText(/opentelem-ruby/i)
      expect(repo).toBeInTheDocument()
      repo.click()
    })

    it('calls submit with repo value', () => {
      expect(onSubmit).toHaveBeenCalledWith(selectedRepo)
    })
  })

  describe('search', () => {
    beforeEach(async () => {
      setup({ repos: { repos: [] }, hasNextPage: true, isLoading: false })
      const SearchInput = screen.getByRole('textbox', {
        name: 'Search',
      })
      user.type(SearchInput, 'something')
    })

    it('Calls query with correct search value', async () => {
      await waitFor(() =>
        expect(useRepos).toHaveBeenLastCalledWith({
          owner: 'codecov',
          sortItem: { direction: 'DESC', ordering: 'COMMIT_DATE' },
          suspense: false,
          term: 'something',
        })
      )
    })

    describe('when search result is empty', () => {
      it('renders no results found message', async () => {
        expect(await screen.findByText(/No results found/)).toBeInTheDocument()
      })
    })
  })
})
