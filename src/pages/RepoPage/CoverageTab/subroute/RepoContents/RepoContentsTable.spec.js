import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, useParams } from 'react-router-dom'

import { useRepoContents, useRepoOverview } from 'services/repo'

import RepoContentsTable from './RepoContentsTable'

jest.mock('services/repo')
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn(() => {}),
}))

const repoContents = [
  {
    name: 'flag2',
    filepath: '',
    percentCovered: 92.78,
    type: 'dir',
  },
  {
    name: 'app.js',
    filepath: '',
    percentCovered: 62.53,
    type: 'file',
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

    it('renders corresponding links', () => {
      const directory = screen.getByText('flag2')
      expect(directory).toHaveAttribute(
        'href',
        '/gh/Rabee-AbuBaker/another-test/tree/default-branch/flag2'
      )

      const file = screen.getByText('app.js')
      expect(file).toHaveAttribute(
        'href',
        '/gh/Rabee-AbuBaker/another-test/blobs/default-branch/app.js'
      )
    })
  })

  describe('when the url has branch and path params', () => {
    beforeEach(() => {
      setup({ branch: 'main', path: 'src' })
    })

    it('renders corresponding links correctly', () => {
      const directory = screen.getByText('flag2')
      expect(directory).toHaveAttribute(
        'href',
        '/gh/Rabee-AbuBaker/another-test/tree/main/src/flag2'
      )

      const file = screen.getByText('app.js')
      expect(file).toHaveAttribute(
        'href',
        '/gh/Rabee-AbuBaker/another-test/blobs/main/src/app.js'
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
