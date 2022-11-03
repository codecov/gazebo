import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, useParams } from 'react-router-dom'

import { useRepoContents, useRepoOverview } from 'services/repo'

import RepoContentsTable from './RepoContentsTable'
import { usePrefetchDirEntry } from './TableEntries/hooks/usePrefetchDirEntry'
import { usePrefetchFileEntry } from './TableEntries/hooks/usePrefetchFileEntry'

jest.mock('services/repo')
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn(() => {}),
}))
jest.mock('./TableEntries/hooks/usePrefetchDirEntry')
jest.mock('./TableEntries/hooks/usePrefetchFileEntry')

const repoContents = [
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
]

const useRepoOverviewMock = {
  data: {
    defaultBranch: 'default-branch',
    private: true,
  },
  isLoading: false,
}

describe('RepoContentsTable', () => {
  function setup({
    isLoading = false,
    data = repoContents,
    branch,
    path,
  } = {}) {
    useRepoContents.mockReturnValue({
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
    usePrefetchDirEntry.mockReturnValue({ runPrefetch: jest.fn() })
    usePrefetchFileEntry.mockReturnValue({ runPrefetch: jest.fn() })

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

    it('renders corresponding links', () => {
      // Open to better ways of doing this if anyone has an idea :)
      const links = screen.getAllByRole('link')
      const flag2Link = links[0]
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
      const flag2Link = links[0]
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

    it('renders spinner', () => {
      expect(screen.getByTestId('spinner')).toBeInTheDocument()
    })
  })

  describe('when no data is returned', () => {
    beforeEach(() => {
      setup({ data: [] })
    })

    it('renders empty state message', () => {
      expect(
        screen.getByText(
          /There was a problem getting repo contents from your provider/
        )
      ).toBeInTheDocument()
    })
  })
})
