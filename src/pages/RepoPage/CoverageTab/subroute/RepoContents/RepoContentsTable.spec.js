import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route } from 'react-router-dom'

import { useRepoOverview } from 'services/repo'
import { useRepoContents } from 'services/repoContents/hooks'

import RepoContentsTable from './RepoContentsTable'

jest.mock('services/repoContents/hooks')
jest.mock('services/repo')

const repoContents = [
  {
    name: 'flag2',
    filepath: '',
    percentCovered: 92.78,
    type: 'dir',
  },
  {
    name: 'app.js',
    filepath: 'src',
    percentCovered: 62.53,
    type: 'file',
  },
]

const useRepoOverviewMock = {
  data: {
    defaultBranch: 'main',
    private: true,
  },
  isLoading: false,
}

describe('RepoContentsTable', () => {
  function setup({ isLoading = false, data = repoContents } = {}) {
    useRepoContents.mockReturnValue({
      data,
      isLoading,
    })
    useRepoOverview.mockReturnValue(useRepoOverviewMock)

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
        '/gh/Rabee-AbuBaker/another-test/tree/main/flag2'
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
