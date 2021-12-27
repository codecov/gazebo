import { render, screen } from '@testing-library/react'
import { Route, MemoryRouter } from 'react-router-dom'
import RepoPage from '.'
import { QueryClientProvider, QueryClient } from 'react-query'
import { useRepo } from 'services/repo/hooks'
import { useCommits } from 'services/commits'

jest.mock('services/repo/hooks')
jest.mock('services/commits')

const commits = [
  {
    message: 'test',
    commitid: '1',
    createdAt: '2020',
    author: {
      username: 'rula',
    },
    totals: {
      coverage: 22,
    },
    parent: {
      totals: {
        coverage: 22,
      },
    },
    compareWithParent: {
      patchTotals: {
        coverage: 33,
      },
    },
  },
]

describe('RepoPage', () => {
  function setup({ repo, commits = [], path = '/' }) {
    useRepo.mockReturnValue({ data: { repo } })
    useCommits.mockReturnValue({ data: commits })
    const queryClient = new QueryClient()
    render(
      <MemoryRouter initialEntries={[`/gh/codecov/Test/${path}`]}>
        <Route path={`/:provider/:owner/:repo/${path}`}>
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

    it('does not render the branch in the breadcrumb', () => {
      const branch = screen.queryByText(/main/)
      expect(branch).not.toBeInTheDocument()
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

  describe('when rendered with a repo that has commits', () => {
    beforeEach(() => {
      setup({
        repo: {
          private: true,
        },
        commits,
      })
    })

    it('renders the covergae tab', () => {
      const tab = screen.getByText(/Coverage/)
      expect(tab).toBeInTheDocument()
    })
    it('renders the commits tab', () => {
      const tab = screen.getByText(/Commits/)
      expect(tab).toBeInTheDocument()
    })
  })

  describe('when rendered with a repo that has no commits', () => {
    beforeEach(() => {
      setup({
        repo: {
          private: true,
        },
      })
    })

    it('renders the covergae tab', () => {
      const tab = screen.queryByText(/Coverage/)
      expect(tab).not.toBeInTheDocument()
    })
    it('renders the commits tab', () => {
      const tab = screen.queryByText(/Commits/)
      expect(tab).not.toBeInTheDocument()
    })
  })

  describe('when renders the commits page', () => {
    beforeEach(() => {
      setup({
        repo: {
          private: true,
        },
        path: 'commits',
        commits,
      })
    })

    it('renders the branch in the breadcrumb', () => {
      const branch = screen.getAllByText(/main/)[0]
      expect(branch).toBeInTheDocument()
    })
  })
})
