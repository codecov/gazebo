import { render, screen, waitFor } from 'custom-testing-library'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, useParams } from 'react-router-dom'

import { useCommits } from 'services/commits'
import { useLocationParams } from 'services/navigation'
import { useRepo } from 'services/repo'
import { useOwner } from 'services/user'

import CoverageTab from './CoverageTab'

jest.mock('./subroute/Fileviewer', () => () => 'Fileviewer Component')
jest.mock('./subroute/RepoContents', () => () => 'RepoContents Component')
jest.mock('./Summary', () => () => 'Summary Component')
jest.mock('./Chart', () => () => 'Chart Component')
jest.mock('./DeactivatedRepo', () => () => 'Disabled Repo Component')
jest.mock('./DisplayTypeButton', () => () => 'Display Type Button')
jest.mock('services/repo')
jest.mock('services/user')
jest.mock('services/commits')

jest.mock('services/navigation', () => ({
  ...jest.requireActual('services/navigation'),
  useLocationParams: jest.fn(),
}))
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn(() => {}),
}))

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
})

describe('Coverage Tab', () => {
  const mockUpdateParams = jest.fn()
  let testLocation
  let originalLocation

  beforeAll(() => {
    originalLocation = global.window.location
    delete global.window.location
    global.window.location = {
      replace: jest.fn(),
    }
  })

  afterAll(() => {
    jest.resetAllMocks()
    window.location = originalLocation
  })

  function setup({
    initialEntries,
    repoActivated = true,
    repoIsUndefined = false,
    repoIsPrivate = false,
    isPartOfOrg = true,
    hasCommits = true,
  }) {
    useParams.mockReturnValue({
      owner: 'test-org',
      provider: 'gh',
      repo: 'test-repo',
    })

    if (repoIsUndefined) {
      useRepo.mockReturnValue({
        data: { repository: null },
      })
    } else if (repoIsPrivate) {
      useRepo.mockReturnValue({
        data: { repository: { private: true } },
      })
    } else {
      useRepo.mockReturnValue({
        data: { repository: { activated: repoActivated } },
      })
    }

    if (hasCommits) {
      useCommits.mockReturnValue({ data: { commits: [{}, {}] } })
    } else {
      useCommits.mockReturnValue({ data: { commits: [] } })
    }

    useOwner.mockReturnValue({ data: { isCurrentUserPartOfOrg: isPartOfOrg } })

    useLocationParams.mockReturnValue({
      params: { search: '' },
      updateParams: mockUpdateParams,
    })

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={initialEntries}>
          <Route path="/:provider/:owner/:repo/tree/:branch/:path+" exact>
            <CoverageTab />
          </Route>
          <Route path="/:provider/:owner/:repo/tree/:branch" exact>
            <CoverageTab />
          </Route>
          <Route path="/:provider/:owner/:repo/blob/:ref/:path+">
            <CoverageTab />
          </Route>
          <Route path="/:provider/:owner/:repo" exact={true}>
            <CoverageTab />
          </Route>
          <Route
            path="*"
            render={({ location }) => {
              testLocation = location
              return null
            }}
          />
        </MemoryRouter>
      </QueryClientProvider>
    )
  }

  describe('when rendered with default route', () => {
    beforeEach(() => {
      setup({ initialEntries: ['/gh/test-org/test-repo/'] })
    })

    it('renders summary, display type button, and root tree component', () => {
      expect(screen.getByText(/Summary Component/)).toBeInTheDocument()
      expect(screen.getByText(/Display Type Button/)).toBeInTheDocument()
      expect(screen.queryByText(/Fileviewer Component/)).not.toBeInTheDocument()
    })
  })

  describe('when rendered with tree+branch on default route returns the root of the project', () => {
    beforeEach(() => {
      setup({ initialEntries: ['/gh/test-org/test-repo/tree/some-branch'] })
    })

    it('renders summary and root tree component', () => {
      expect(screen.getByText(/Summary Component/)).toBeInTheDocument()
      expect(screen.getByText(/RepoContents Component/)).toBeInTheDocument()
      expect(screen.queryByText(/Fileviewer Component/)).not.toBeInTheDocument()
    })
  })

  describe('when rendered with tree+branch route returns the root of that branch', () => {
    beforeEach(() => {
      setup({ initialEntries: ['/gh/test-org/test-repo/tree/main'] })
    })

    it('renders summary and root tree component', () => {
      expect(screen.getByText(/Summary Component/)).toBeInTheDocument()
      expect(screen.getByText(/RepoContents Component/)).toBeInTheDocument()
      expect(screen.queryByText(/Fileviewer Component/)).not.toBeInTheDocument()
    })
  })

  describe('when rendered with tree+branch route on a sub folder', () => {
    beforeEach(() => {
      setup({ initialEntries: ['/gh/test-org/test-repo/tree/master/src'] })
    })

    it('renders summary and root tree component', () => {
      expect(screen.getByText(/Summary Component/)).toBeInTheDocument()
      expect(screen.getByText(/RepoContents Component/)).toBeInTheDocument()
      expect(screen.queryByText(/Fileviewer Component/)).not.toBeInTheDocument()
    })
  })

  describe('when rendered with blob route', () => {
    beforeEach(async () => {
      setup({
        initialEntries: ['/gh/test-org/test-repo/blob/main/path/to/file.js'],
      })
      await waitFor(() =>
        expect(screen.queryByTestId('spinner')).not.toBeInTheDocument()
      )
    })

    it('renders summary and root tree component', () => {
      expect(screen.getByText(/Summary Component/)).toBeInTheDocument()
      expect(screen.getByText(/Fileviewer Component/)).toBeInTheDocument()
      expect(
        screen.queryByText(/RepoContents Component/)
      ).not.toBeInTheDocument()
    })
  })

  describe.each([
    '/gh/test-org/test-repo/',
    '/gh/test-org/test-repo/tree/main',
    '/gh/test-org/test-repo/tree/master/src',
  ])('update search params after typing on route %s', (entries) => {
    beforeEach(() => {
      setup({ initialEntries: [entries] })
      const searchInput = screen.getByRole('textbox', {
        name: 'Search for files',
      })
      userEvent.type(searchInput, 'file.js')
    })

    it('calls setSearchValue', async () => {
      await waitFor(() => expect(mockUpdateParams).toHaveBeenCalled())
      await waitFor(() =>
        expect(mockUpdateParams).toHaveBeenCalledWith({ search: 'file.js' })
      )
    })
  })

  describe('when repo has no commits', () => {
    beforeEach(() => {
      setup({
        initialEntries: ['/gh/test-org/test-repo/'],
        hasCommits: false,
      })
    })

    it('redirects to the new repo page', async () => {
      expect(testLocation.pathname).toBe('/gh/test-org/test-repo/new')
    })
  })

  describe('when user does not belong to org and repo is private', () => {
    beforeEach(() => {
      setup({
        initialEntries: ['/gh/test-org/test-repo/'],
        repoIsPrivate: true,
        isPartOfOrg: false,
      })
    })

    it('renders 404', async () => {
      const notFound = await screen.findByText('Not found')
      expect(notFound).toBeInTheDocument()
    })

    it('redirects the user', () => {
      expect(window.location.replace).toHaveBeenCalledTimes(1)
      expect(window.location.replace).toBeCalledWith('/gh')
    })
  })

  describe('when repo is disabled', () => {
    describe('user belongs to the org', () => {
      beforeEach(() => {
        setup({
          initialEntries: ['/gh/test-org/test-repo/'],
          repoActivated: false,
        })
      })

      it('renders Disabled Repo component', () => {
        expect(screen.getByText(/Disabled Repo Component/)).toBeInTheDocument()
      })
    })

    describe('user is not part of org', () => {
      beforeEach(() => {
        setup({
          initialEntries: ['/gh/test-org/test-repo/'],
          repoActivated: false,
          isPartOfOrg: false,
        })
      })

      it('renders 404', async () => {
        const notFound = await screen.findByText('Not found')
        expect(notFound).toBeInTheDocument()
      })

      it('redirects the user', () => {
        expect(window.location.replace).toHaveBeenCalledTimes(1)
        expect(window.location.replace).toBeCalledWith('/gh')
      })
    })
  })
})
