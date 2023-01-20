import { isEqual } from 'lodash'
import { useCallback, useMemo } from 'react'
import { useParams } from 'react-router-dom'

import { useLocationParams } from 'services/navigation'
import { useRepoCommitContents } from 'services/repo'
import { useCommitTreePaths } from 'shared/treePaths'
import { SortingDirection } from 'ui/Table/constants'

import { displayTypeParameter } from '../constants'
import CoverageEntry from '../TableEntries/BaseEntries/CoverageEntry'
import CommitDirEntry from '../TableEntries/CommitEntries/CommitDirEntry'
import CommitFileEntry from '../TableEntries/CommitEntries/CommitFileEntry'
import { useTableDefaultSort } from '../useTableDefaultSort'
import { adjustListIfUpDir } from '../utils'

function determineDisplayType({ filters, isSearching }) {
  return filters?.displayType === displayTypeParameter.list || isSearching
    ? displayTypeParameter.list
    : displayTypeParameter.tree
}

function createTableData({
  tableData,
  commitSha,
  path,
  isSearching,
  filters,
  treePaths,
}) {
  if (tableData?.length > 0) {
    const displayType = determineDisplayType({ filters, isSearching })

    const rawTableRows = tableData?.map(
      ({
        name,
        percentCovered,
        __typename,
        path: filePath,
        isCriticalFile,
        misses,
        partials,
        hits,
        lines,
      }) => ({
        name:
          __typename === 'PathContentDir' ? (
            <CommitDirEntry
              name={name}
              commitSha={commitSha}
              path={path}
              filters={filters}
            />
          ) : (
            <CommitFileEntry
              name={name}
              path={path}
              commitSha={commitSha}
              filePath={filePath}
              displayType={displayType}
              isCriticalFile={isCriticalFile}
            />
          ),
        lines,
        misses,
        hits,
        partials,
        coverage: <CoverageEntry percentCovered={percentCovered} />,
      })
    )

    const finalizedTableRows = adjustListIfUpDir({
      treePaths,
      displayType,
      rawTableRows,
    })

    return finalizedTableRows
  }

  return []
}

const headers = [
  {
    id: 'name',
    header: 'Files',
    accessorKey: 'name',
    cell: (info) => info.getValue(),
    width: 'w-2/12 md:w-5/12',
    justifyStart: true,
  },
  {
    id: 'lines',
    header: <span className="md:whitespace-nowrap">Tracked lines</span>,
    accessorKey: 'lines',
    cell: (info) => info.getValue(),
    width: 'w-2/12 md:w-1/12 justify-end font-lato',
  },
  {
    id: 'hits',
    header: 'Covered',
    accessorKey: 'hits',
    cell: (info) => info.getValue(),
    width: 'w-2/12 md:w-1/12 justify-end font-lato',
  },
  {
    id: 'partials',
    header: 'Partial',
    accessorKey: 'partials',
    cell: (info) => info.getValue(),
    width: 'w-2/12 md:w-1/12 justify-end font-lato',
  },
  {
    id: 'misses',
    header: 'Missed',
    accessorKey: 'misses',
    cell: (info) => info.getValue(),
    width: 'w-2/12 justify-end font-lato',
  },
  {
    id: 'coverage',
    header: 'Coverage %',
    accessorKey: 'coverage',
    cell: (info) => info.getValue(),
    width: 'w-2/12 md:w-3/12',
  },
]

const defaultQueryParams = {
  search: '',
  displayType: '',
}

const sortingParameter = Object.freeze({
  name: 'NAME',
  coverage: 'COVERAGE',
  hits: 'HITS',
  misses: 'MISSES',
  partials: 'PARTIALS',
  lines: 'LINES',
})

const getQueryFilters = ({ params, sortBy }) => {
  return {
    ...(params?.search && { searchValue: params.search }),
    ...(params?.displayType && {
      displayType: displayTypeParameter[params?.displayType],
    }),
    ...(sortBy && {
      ordering: {
        direction: sortBy?.desc ? SortingDirection.DESC : SortingDirection.ASC,
        parameter: sortingParameter[sortBy?.id],
      },
    }),
  }
}

export function useRepoCommitContentsTable() {
  const { provider, owner, repo, path, commit } = useParams()
  const { params } = useLocationParams(defaultQueryParams)
  const { treePaths } = useCommitTreePaths()
  const [sortBy, setSortBy] = useTableDefaultSort()

  const { data: commitData, isLoading: commitIsLoading } =
    useRepoCommitContents({
      provider,
      owner,
      repo,
      commit,
      path: path || '',
      filters: getQueryFilters({ params, sortBy: sortBy[0] }),
      opts: {
        suspense: false,
      },
    })

  const data = useMemo(
    () =>
      createTableData({
        tableData: commitData?.results,
        commitSha: commit,
        path: path || '',
        isSearching: !!params?.search,
        filters: getQueryFilters({ params, sortBy: sortBy[0] }),
        treePaths,
      }),
    [commitData, commit, path, params, sortBy, treePaths]
  )

  const handleSort = useCallback(
    (tableSortBy) => {
      if (tableSortBy?.length > 0 && !isEqual(sortBy, tableSortBy)) {
        setSortBy(tableSortBy)
      }
    },
    [sortBy, setSortBy]
  )

  return {
    data,
    headers,
    handleSort,
    isLoading: commitIsLoading,
    isSearching: !!params?.search,
  }
}
