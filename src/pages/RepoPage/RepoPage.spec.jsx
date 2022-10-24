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
  let testLocation

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
      const view = repoPageRender({
        renderCommits: () => <RepoPage />,
        initialEntries,
      })

      testLocation = view.testLocation
    } else {
      const view = repoPageRender({
        renderRoot: () => <RepoPage />,
      })

      testLocation = view.testLocation
    }
  }

  describe('when rendered', () => {
    beforeEach(() => {
      setup({
        repository: { private: false, defaultBranch: 'main', activated: true },
        commits: { commits },
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
          commits: { commits },
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

      it('redirects the user', () => {
        expect(testLocation.pathname).toBe('/gh')
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
    it('redirects to the setup repo page', () => {
      expect(testLocation.pathname).toBe('/gh/codecov/test-repo/new')
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
      const select = await screen.findByRole('button', {
        name: 'Select branch',
      })
      expect(select).toBeInTheDocument()
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
      const select = await screen.findByRole('button', {
        name: 'Select branch',
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
      const select = await screen.findByRole('button', {
        name: 'Select branch',
      })
      userEvent.click(select)

      const branch = await screen.findByText(/test1/)
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
      const settings = screen.queryByText(/Settings/)
      expect(settings).not.toBeInTheDocument()
    })
  })

  describe('when rendered with a disabled repo', () => {
    describe('when the repo is public', () => {
      describe('when the user belongs to the org', () => {
        beforeEach(() => {
          setup({
            repository: {
              private: false,
              activated: false,
            },
            commits: { commits },
          })
        })

        it('renders deactivated repo component', () => {
          const deactivated = screen.getByText('This repo has been deactivated')
          expect(deactivated).toBeInTheDocument()
        })

        it('renders link to settings tab', () => {
          const link = screen.getByText('Settings')
          expect(link).toBeInTheDocument()
          expect(link).toHaveAttribute('href', '/gh/codecov/test-repo/settings')
        })
      })

      describe('when the user does not belong to the org', () => {
        beforeEach(() => {
          setup({
            repository: {
              private: false,
              activated: false,
            },
            commits: { commits },
            isCurrentUserPartOfOrg: false,
          })
        })

        it('renders deactivated repo component', () => {
          const deactivated = screen.getByText('This repo has been deactivated')
          expect(deactivated).toBeInTheDocument()
        })

        it('does not render link to settings tab', () => {
          const link = screen.queryByText('Settings')
          expect(link).not.toBeInTheDocument()
        })
      })
    })

    describe('when the repo is private', () => {
      describe('when the user belongs to the org', () => {
        beforeEach(() => {
          setup({
            repository: {
              private: true,
              activated: false,
            },
            commits: { commits },
          })
        })

        it('renders deactivated repo component', () => {
          const deactivated = screen.getByText('This repo has been deactivated')
          expect(deactivated).toBeInTheDocument()
        })

        it('renders link to settings tab', () => {
          const link = screen.getByText('Settings')
          expect(link).toBeInTheDocument()
          expect(link).toHaveAttribute('href', '/gh/codecov/test-repo/settings')
        })
      })

      describe('when the user does not belong to the org', () => {
        beforeEach(() => {
          setup({
            repository: {
              private: true,
              activated: false,
            },
            commits: { commits },
            isCurrentUserPartOfOrg: false,
          })
        })

        it('redirects to the provider', () => {
          expect(testLocation.pathname).toBe('/gh')
        })
      })
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
      const flags = screen.getByText('Flags')
      expect(flags).toBeInTheDocument()
    })
  })

  describe('when there is no repo data', () => {
    beforeEach(() => {
      setup({
        repository: null,
        commits: { commits },
      })
    })

    it('redirects to provider page', () => {
      expect(testLocation.pathname).toBe('/gh')
    })
  })
})
