import userEvent from '@testing-library/user-event'

import { useBranches } from 'services/branches'
import { useCommits } from 'services/commits'
import { useRepo } from 'services/repo'
import { useOwner } from 'services/user'

import { repoPageRender, screen, waitFor } from './repo-jest-setup'

import { useFlags } from '../../shared/featureFlags'

import RepoPage from '.'

jest.mock('services/repo/useRepo')
jest.mock('services/commits')
jest.mock('services/branches')
jest.mock('services/user')
jest.mock('shared/featureFlags')

// This component is too complex for an integration test imo
jest.mock('./CoverageTab', () => () => 'CoverageTab')

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

const branches = [
  {
    name: 'main',
  },
  {
    name: 'test1',
  },
  {
    name: 'test2',
  },
]

describe('RepoPage', () => {
  function setup({
    repository,
    commits,
    initialEntries,
    isCurrentUserPartOfOrg = true,
    flagValue = false,
  }) {
    useRepo.mockReturnValue({ data: { repository } })
    useCommits.mockReturnValue({ data: commits })
    useBranches.mockReturnValue({ data: branches })
    useOwner.mockReturnValue({ data: { isCurrentUserPartOfOrg } })
    useFlags.mockReturnValue({
      gazeboFlagsTab: flagValue,
    })

    // repoPageRender is mostly for making individual tabs easier, so this is a bit jank for integration tests.
    if (initialEntries) {
      repoPageRender({
        renderCommits: () => <RepoPage />,
        initialEntries,
      })
    } else {
      repoPageRender({
        renderRoot: () => <RepoPage />,
      })
    }
  }

  describe('when rendered', () => {
    beforeEach(() => {
      setup({
        repository: { private: false, defaultBranch: 'main', activated: true },
      })
    })

    it('renders the title with the owner name', () => {
      const owner = screen.getByText(/codecov/)
      expect(owner).toBeInTheDocument()
    })

    it('renders the title with the repo name', () => {
      const repo = screen.getByText(/test-repo/)
      expect(repo).toBeInTheDocument()
    })
  })

  describe('when rendered with private repo', () => {
    describe('user is part of org', () => {
      beforeEach(() => {
        setup({
          repository: {
            private: true,
          },
        })
      })

      it('renders the title with the owner name', () => {
        const owner = screen.getByText(/codecov/)
        expect(owner).toBeInTheDocument()
      })

      it('renders the title with the repo name', () => {
        const repo = screen.getByText(/test-repo/)
        expect(repo).toBeInTheDocument()
      })

      it('renders the block private', () => {
        const privateSpan = screen.getByText('lock-closed.svg')
        expect(privateSpan).toBeInTheDocument()
      })
    })

    describe('user is not part of org', () => {
      beforeEach(() => {
        setup({
          repository: {
            private: true,
          },
          isCurrentUserPartOfOrg: false,
        })
      })

      it('renders 404 page', () => {
        const notFound = screen.getByText(/404/)
        expect(notFound).toBeInTheDocument()
      })
    })
  })

  describe('when rendered with a repo that has commits', () => {
    beforeEach(() => {
      setup({
        repository: {
          private: true,
          activated: true,
        },
        commits: { commits },
      })
    })

    it('renders the coverage tab', () => {
      const tab = screen.getByText('Coverage')
      expect(tab).toBeInTheDocument()
    })
    it('renders the commits tab', () => {
      const tab = screen.getByText(/Commits/)
      expect(tab).toBeInTheDocument()
    })
  })

  describe('when rendered with a repo that has errored on the commits res', () => {
    beforeEach(() => {
      setup({
        repository: {
          private: true,
          activated: true,
        },
      })
    })

    it('renders the coverage tab', () => {
      const tab = screen.queryByText('Coverage')
      expect(tab).not.toBeInTheDocument()
    })
    it('renders the commits tab', () => {
      const tab = screen.queryByText(/Commits/)
      expect(tab).not.toBeInTheDocument()
    })
  })

  describe('when rendered with a repo that has no commits', () => {
    beforeEach(() => {
      setup({
        repository: {
          private: true,
          activated: true,
        },
        commits: { commits: [] },
      })
    })

    it('renders the coverage tab', () => {
      const tab = screen.queryByText('Coverage')
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
        repository: {
          private: true,
          defaultBranch: 'main',
          activated: true,
        },
        path: 'commits',
        commits: { commits },
        initialEntries: ['/gh/codecov/test-repo/commits'],
      })
    })

    it('renders the branch in the breadcrumb', async () => {
      const branch = screen.queryByTestId('breadcrumb-repo')
      await waitFor(() => expect(branch).toBeInTheDocument())
    })

    it('renders the branch context selector label', () => {
      const label = screen.getByText('Branch Context')
      expect(label).toBeInTheDocument()
    })

    it('renders the branch context selector', async () => {
      const select = screen.getByRole('button', {
        name: 'Select branch',
      })
      await waitFor(() => expect(select).toBeInTheDocument())
    })
  })

  describe('when click on the selector in the commits page', () => {
    beforeEach(async () => {
      setup({
        repository: {
          private: true,
          defaultBranch: 'main',
          activated: true,
        },
        path: 'commits',
        commits: { commits },
        initialEntries: ['/gh/codecov/test/commits'],
      })
      let select
      await waitFor(() => {
        select = screen.getByRole('button', {
          name: 'Select branch',
        })
      })
      userEvent.click(select)
    })

    it('renders the options of select branch', () => {
      const branch = screen.getByText(/test1/)
      expect(branch).toBeInTheDocument()
      const branch2 = screen.getByText(/test2/)
      expect(branch2).toBeInTheDocument()
    })
  })

  describe('when a branch is selected in the commits page', () => {
    beforeEach(async () => {
      setup({
        repository: {
          private: true,
          defaultBranch: 'main',
          activated: true,
        },
        path: 'commits',
        commits: { commits },
        initialEntries: ['/gh/codecov/test/commits'],
      })
      let select
      await waitFor(() => {
        select = screen.getByRole('button', {
          name: 'Select branch',
        })
      })
      userEvent.click(select)

      const branch = screen.getByText(/test1/)
      userEvent.click(branch)
    })

    it('renders the name of the branch in the breadcrumb', () => {
      const branch = screen.getAllByText(/test1/)
      expect(branch.length).toEqual(2)
    })
  })

  describe('when rendered with user not part of org', () => {
    beforeEach(() => {
      setup({
        repository: {
          private: false,
          activated: true,
        },
        commits: { commits },
        isCurrentUserPartOfOrg: false,
      })
    })

    it('does not render the settings tab', () => {
      expect(screen.queryByText(/Settings/)).not.toBeInTheDocument()
    })
  })

  describe('when rendered with a disabled repo', () => {
    beforeEach(() => {
      setup({
        repository: {
          private: true,
          activated: false,
        },
        commits: { commits },
      })
    })

    it('renders coverage tab', () => {
      expect(screen.getByText('Coverage')).toBeInTheDocument()
    })

    it('renders settings tab', () => {
      expect(screen.getByText('Settings')).toBeInTheDocument()
    })

    it('does not render commits tab', () => {
      expect(screen.queryByText(/Commits/)).not.toBeInTheDocument()
    })

    it('does not render pulls tab', () => {
      expect(screen.queryByText(/pulls/)).not.toBeInTheDocument()
    })
  })

  describe('when the repo is activated and the flags feature flag is true', () => {
    beforeEach(() => {
      setup({
        repository: {
          private: true,
          activated: true,
        },
        commits: { commits },
        flagValue: true,
      })
    })

    it('renders coverage tab', () => {
      expect(screen.getByText('Flags')).toBeInTheDocument()
    })
  })
})
