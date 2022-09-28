import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, useParams } from 'react-router-dom'

import { useRepoContents, useRepoOverview } from 'services/repo'
import A from 'ui/A'
import Icon from 'ui/Icon'
import Progress from 'ui/Progress'

import useRepoContentsTable from './hooks'
import RepoContentsTable from './RepoContentsTable'

jest.mock('services/repo')
jest.mock('./hooks')
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn(() => {}),
}))

const repoContents = [
  {
    name: 'flag2',
    filePath: 'src/flags',
    percentCovered: 92.78,
    type: 'dir',
  },
]

const useRepoOverviewMock = {
  paginatedData: {
    defaultBranch: 'default-branch',
    private: true,
  },
  isLoading: false,
}

const headers = [
  {
    id: 'name',
    header: 'Files',
    accessorKey: 'name',
    width: 'w-9/12 min-w-min',
    cell: (info) => info.getValue(),
  },
  {
    id: 'coverage',
    header: <span className="w-full text-right">file coverage %</span>,
    accessorKey: 'coverage',
    width: 'w-3/12 min-w-min',
    cell: (info) => info.getValue(),
  },
]

function createTable({ tableData, branch, path, isSearching }) {
  return tableData?.length > 0
    ? tableData.map(({ name, percentCovered, type, filePath }) => ({
        name: (
          <div className="flex flex-col gap-1 text-ds-gray-quinary">
            <div className="flex gap-2">
              <Icon name={type === 'dir' ? 'folder' : 'document'} size="md" />
              <A
                to={{
                  pageName: `${type === 'dir' ? 'treeView' : 'fileViewer'}`,
                  options: {
                    ref: branch || 'default-branch',
                    tree: Boolean(path) ? `${path}/${name}` : name,
                  },
                }}
              >
                {name}
              </A>
            </div>
            {isSearching && <span className="text-xs pl-1"> {filePath} </span>}
          </div>
        ),
        coverage: (
          <div className="flex flex-1 gap-2 items-center">
            <Progress amount={percentCovered} label />
          </div>
        ),
      }))
    : []
}

describe('RepoContentsTableMocked', () => {
  let handleSort = jest.fn()
  let handlePaginationClick = jest.fn()
  const branch = 'default-branch'
  const path = 'src/flags'

  function setup({
    paginatedData = repoContents,
    isSearching = false,
    hasNextPage = true,
  } = {}) {
    useRepoContents.mockReturnValue({
      paginatedData,
      isLoading: false,
    })
    useRepoOverview.mockReturnValue(useRepoOverviewMock)
    useParams.mockReturnValue({
      owner: 'Rabee-AbuBaker',
      provider: 'gh',
      repo: 'another-test',
      branch,
      path,
    })

    useRepoContentsTable.mockReturnValue({
      paginatedData: createTable({
        tableData: paginatedData,
        branch,
        path,
        isSearching,
      }),
      headers,
      handleSort,
      handlePaginationClick,
      isLoading: false,
      isSearching,
      hasNextPage,
    })

    render(
      <MemoryRouter initialEntries={['/gh/Rabee-AbuBaker/another-test']}>
        <Route path="/:provider/:owner/:repo/">
          <RepoContentsTable />
        </Route>
      </MemoryRouter>
    )
  }

  describe('when sorting', () => {
    beforeEach(() => {
      setup()
    })

    it('calls handleSort', async () => {
      screen.getByText(/Files/).click()
      await waitFor(() =>
        expect(handleSort).toHaveBeenLastCalledWith([
          { desc: true, id: 'name' },
        ])
      )
      screen.getByText(/file coverage/).click()
      await waitFor(() =>
        expect(handleSort).toHaveBeenLastCalledWith([
          { desc: true, id: 'coverage' },
        ])
      )
    })
  })

  describe('when clicking on more data', () => {
    beforeEach(() => {
      setup()
    })

    it('calls handlePaginationClick', async () => {
      expect(screen.getByText(/Load More/)).toBeInTheDocument()
      screen.getByText(/Load More/).click()
      await waitFor(() => expect(handlePaginationClick).toHaveBeenCalled())
    })
  })

  describe('when searching', () => {
    it('renders path in the table', () => {
      setup({ isSearching: true })
      expect(screen.getByText(/src\/flags/)).toBeInTheDocument()
    })

    describe('when there are no results', () => {
      it('shows correct empty state message', () => {
        setup({ paginatedData: [], isSearching: true })
        expect(screen.getByText(/No results found/)).toBeInTheDocument()
      })
    })
  })
})
