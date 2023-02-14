import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, useParams } from 'react-router-dom'

import { useLocationParams } from 'services/navigation'
import { useRepoBranchContents, useRepoOverview } from 'services/repo'
import { usePrefetchBranchDirEntry } from 'shared/ContentsTable/TableEntries/BranchEntries/hooks/usePrefetchBranchDirEntry'
import { usePrefetchBranchFileEntry } from 'shared/ContentsTable/TableEntries/BranchEntries/hooks/usePrefetchBranchFileEntry'

import RepoContentsTable from './RepoContentsTable'

jest.mock('services/repo')

jest.mock('services/navigation', () => ({
  ...jest.requireActual('services/navigation'),
  useLocationParams: jest.fn(),
}))

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn(() => {}),
}))

jest.mock(
  'shared/ContentsTable/TableEntries/BranchEntries/hooks/usePrefetchBranchDirEntry'
)

jest.mock(
  'shared/ContentsTable/TableEntries/BranchEntries/hooks/usePrefetchBranchFileEntry'
)

const repoContents = {
  results: [
    {
      name: 'flag2',
      path: '',
      percentCovered: 92.78,
      __typename: 'PathContentDir',
      hits: 456,
      misses: 234,
      lines: 789,
      partials: 123,
    },
    {
      name: 'app.js',
      path: '',
      percentCovered: 62.53,
      isCriticalFile: false,
      __typename: 'PathContentFile',
      hits: 567,
      misses: 345,
      lines: 891,
      partials: 233,
    },
  ],
}

const useRepoOverviewMock = {
  data: {
    defaultBranch: 'default-branch',
    private: true,
  },
  isLoading: false,
}

describe('RepoContentsTable', () => {
  const mockUpdateParams = jest.fn()

  function setup({
    isLoading = false,
    data = repoContents,
    branch,
    path,
  } = {}) {
    useRepoBranchContents.mockReturnValue({
      data,
      isLoading,
    })

    useRepoOverview.mockReturnValue(useRepoOverviewMock)

    useParams.mockReturnValue({
      owner: 'Rabee-AbuBaker',
      provider: 'gh',
      repo: 'another-test',
      branch: branch,
      path: path || '',
    })

    usePrefetchBranchDirEntry.mockReturnValue({ runPrefetch: jest.fn() })
    usePrefetchBranchFileEntry.mockReturnValue({ runPrefetch: jest.fn() })

    useLocationParams.mockReturnValue({
      params: { search: '' },
      updateParams: mockUpdateParams,
    })

    render(
      <MemoryRouter initialEntries={['/gh/Rabee-AbuBaker/another-test']}>
        <Route path="/:provider/:owner/:repo/">
          <RepoContentsTable />
        </Route>
      </MemoryRouter>
    )
  }

  describe('when rendered', () => {
    beforeEach(() => {
      setup()
    })

    it('renders repo contents', () => {
      expect(screen.getByText('flag2')).toBeInTheDocument()
      expect(screen.getByText('app.js')).toBeInTheDocument()
    })

    it('renders coverage', () => {
      expect(screen.getByText(/92.78%/)).toBeInTheDocument()
      expect(screen.getByText(/62.53%/)).toBeInTheDocument()
    })

    it('renders hits', () => {
      expect(screen.getByText(/456/)).toBeInTheDocument()
      expect(screen.getByText(/567/)).toBeInTheDocument()
    })

    it('renders lines', () => {
      expect(screen.getByText(/789/)).toBeInTheDocument()
      expect(screen.getByText(/891/)).toBeInTheDocument()
    })

    it('renders misses', () => {
      expect(screen.getByText(/234/)).toBeInTheDocument()
      expect(screen.getByText(/345/)).toBeInTheDocument()
    })

    it('renders partials', () => {
      expect(screen.getByText(/123/)).toBeInTheDocument()
      expect(screen.getByText(/233/)).toBeInTheDocument()
    })

    it('renders up directory link', () => {
      // Open to better ways of doing this if anyone has an idea :)
      const links = screen.getAllByRole('link')
      const flag2Link = links[0]
      expect(flag2Link).toHaveAttribute(
        'href',
        '/gh/Rabee-AbuBaker/another-test/tree/'
      )
    })

    it('renders corresponding links', () => {
      // Open to better ways of doing this if anyone has an idea :)
      const links = screen.getAllByRole('link')
      const flag2Link = links[2]
      expect(flag2Link).toHaveAttribute(
        'href',
        '/gh/Rabee-AbuBaker/another-test/tree/default-branch/flag2'
      )
    })
  })

  describe('when the url has branch and path params', () => {
    beforeEach(() => {
      setup({ branch: 'main', path: 'src' })
    })

    it('renders corresponding links correctly', () => {
      // Open to better ways of doing this if anyone has an idea :)
      const links = screen.getAllByRole('link')
      const flag2Link = links[2]
      expect(flag2Link).toHaveAttribute(
        'href',
        '/gh/Rabee-AbuBaker/another-test/tree/main/src/flag2'
      )
    })
  })

  describe('when loading', () => {
    beforeEach(() => {
      setup({ isLoading: true })
    })

    it('renders two spinners', () => {
      const spinners = screen.getAllByTestId('spinner')
      expect(spinners.length).toBe(2)
    })
  })

  describe('when no data is returned', () => {
    beforeEach(() => {
      setup({ data: [] })
    })

    it('renders error message', () => {
      expect(
        screen.getByText(
          /There was a problem getting repo contents from your provider/
        )
      ).toBeInTheDocument()
    })
  })

  describe('when head commit has no reports', () => {
    beforeEach(() => {
      setup({ data: { __typename: 'MissingHeadReport' } })
    })

    it('renders no report uploaded message', () => {
      expect(
        screen.getByText(
          /No coverage report uploaded for this branch head commit/
        )
      ).toBeInTheDocument()
    })
  })

  describe.each([
    '/gh/test-org/test-repo/',
    '/gh/test-org/test-repo/tree/main',
    '/gh/test-org/test-repo/tree/master/src',
  ])('update search params after typing on route %s', (entries) => {
    beforeEach(() => {
      setup({ initialEntries: [entries] })
    })
    it('calls setSearchValue', async () => {
      const searchInput = await screen.findByRole('textbox', {
        name: 'Search for files',
      })
      userEvent.type(searchInput, 'file.js')

      await waitFor(() => expect(mockUpdateParams).toHaveBeenCalled())
      await waitFor(() =>
        expect(mockUpdateParams).toHaveBeenCalledWith({ search: 'file.js' })
      )
    })
  })
})
