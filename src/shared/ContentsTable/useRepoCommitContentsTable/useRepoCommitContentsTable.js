import { isEqual } from 'lodash'
import { useCallback, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'

import { useLocationParams } from 'services/navigation'
import { useRepoCommitContents, useRepoOverview } from 'services/repo'
import { useCommitTreePaths } from 'shared/treePaths'
import { CommitErrorTypes } from 'shared/utils/commit'
import { SortingDirection } from 'ui/Table/constants'

import { displayTypeParameter } from '../constants'
import CoverageEntry from '../TableEntries/BaseEntries/CoverageEntry'
import CommitDirEntry from '../TableEntries/CommitEntries/CommitDirEntry'
import CommitFileEntry from '../TableEntries/CommitEntries/CommitFileEntry'
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
        lines: <p className="flex flex-1 justify-end">{lines}</p>,
        misses: <p className="flex flex-1 justify-end">{misses}</p>,
        hits: <p className="flex flex-1 justify-end">{hits}</p>,
        partials: <p className="flex flex-1 justify-end">{partials}</p>,
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
    width: 'w-9/12 min-w-min',
    justifyStart: true,
  },
  {
    id: 'lines',
    header: <span className="md:whitespace-nowrap">Tracked lines</span>,
    accessorKey: 'lines',
    cell: (info) => info.getValue(),
    width: 'md:w-36 min-w-min',
  },
  {
    id: 'hits',
    header: 'Covered',
    accessorKey: 'hits',
    cell: (info) => info.getValue(),
    width: 'lg:w-1/12 w-1/5 min-w-min',
  },
  {
    id: 'partials',
    header: 'Partial',
    accessorKey: 'partials',
    cell: (info) => info.getValue(),
    width: 'lg:w-1/12 w-1/5 min-w-min',
  },
  {
    id: 'misses',
    header: 'Missed',
    accessorKey: 'misses',
    cell: (info) => info.getValue(),
    width: 'lg:w-1/12 w-1/5 min-w-min',
  },
  {
    id: 'coverage',
    header: 'Coverage %',
    accessorKey: 'coverage',
    cell: (info) => info.getValue(),
    width: 'w-3/12 min-w-min',
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
  const { provider, owner, repo, path, commitSha } = useParams()
  const { params } = useLocationParams(defaultQueryParams)
  const { treePaths } = useCommitTreePaths()
  const [sortBy, setSortBy] = useState([])

  const { data: repoData, isLoading: repoIsLoading } = useRepoOverview({
    provider,
    repo,
    owner,
  })

  const { data: commitData, commitIsLoading } = useRepoCommitContents({
    provider,
    owner,
    repo,
    commitSha,
    path,
    filters: getQueryFilters({ params, sortBy: sortBy[0] }),
    opts: {
      suspense: false,
    },
  })

  const data = useMemo(
    () =>
      createTableData({
        tableData: commitData,
        commitSha: commitSha,
        path: path || '',
        isSearching: !!params?.search,
        filters: getQueryFilters({ params, sortBy: sortBy[0] }),
        treePaths,
      }),
    [commitData, commitSha, path, params, sortBy, treePaths]
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
    isLoading: repoIsLoading || commitIsLoading,
    isSearching: !!params?.search,
    isMissingHeadReport:
      repoData?.__typename === CommitErrorTypes.MISSING_HEAD_REPORT,
  }
}
