import isEqual from 'lodash/isEqual'
import { useCallback, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'

import { useLocationParams } from 'services/navigation'
import { useRepoContents, useRepoOverview } from 'services/repo'
import A from 'ui/A'
import Icon from 'ui/Icon'
import Progress from 'ui/Progress'

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
                    ref: branch,
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

const headers = [
  {
    Header: 'Files',
    accessor: 'name',
    width: 'w-9/12 min-w-min',
  },
  {
    Header: <span className="w-full text-right">file coverage %</span>,
    accessor: 'coverage',
    width: 'w-3/12 min-w-min',
  },
]

const defaultQueryParams = {
  search: '',
}

const sortingParameter = {
  name: 'NAME',
  coverage: 'COVERAGE',
}

const getQueryFilters = ({ params, sortBy }) => {
  return {
    ...(params?.search && { searchValue: params.search }),
    ...(sortBy[0] && {
      ordering: {
        direction: sortBy[0].desc ? 'DESC' : 'ASC',
        parameter: sortingParameter[sortBy[0]?.id],
      },
    }),
  }
}

function useRepoContentsTable() {
  const { provider, owner, repo, path, branch } = useParams()
  const { params } = useLocationParams(defaultQueryParams)

  const [sortBy, setSortBy] = useState([])

  const { data: repoOverview, isLoadingRepo } = useRepoOverview({
    provider,
    repo,
    owner,
  })
  const { defaultBranch } = repoOverview
  const isSearching = Boolean(params?.search)

  const { data: repoContents, isLoading } = useRepoContents({
    provider,
    owner,
    repo,
    branch: branch || defaultBranch,
    path: path || '',
    filters: getQueryFilters({ params, sortBy }),
  })

  const data = useMemo(
    () =>
      createTable({
        tableData: repoContents,
        branch: branch || defaultBranch,
        path,
        isSearching,
      }),
    [repoContents, branch, defaultBranch, path, isSearching]
  )

  const handleSort = useCallback(
    (tableSortBy) => {
      if (!isEqual(sortBy, tableSortBy)) {
        setSortBy(tableSortBy)
      }
    },
    [sortBy]
  )

  return {
    data,
    headers,
    handleSort,
    isLoading: isLoadingRepo || isLoading,
    isSearching,
  }
}

export default useRepoContentsTable
