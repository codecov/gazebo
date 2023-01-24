import isEqual from 'lodash/isEqual'
import { useCallback, useMemo } from 'react'
import { useParams } from 'react-router-dom'

import { useLocationParams } from 'services/navigation'
import { useRepoBranchContents, useRepoOverview } from 'services/repo'
import { useTableDefaultSort } from 'shared/ContentsTable/useTableDefaultSort'
import { useTreePaths } from 'shared/treePaths'
import { CommitErrorTypes } from 'shared/utils/commit'
import { SortingDirection } from 'ui/Table/constants'

import { displayTypeParameter } from '../constants'
import CoverageEntry from '../TableEntries/BaseEntries/CoverageEntry'
import BranchDirEntry from '../TableEntries/BranchEntries/BranchDirEntry'
import BranchFileEntry from '../TableEntries/BranchEntries/BranchFileEntry'
import { adjustListIfUpDir } from '../utils'

function determineDisplayType({ filters, isSearching }) {
  return filters?.displayType === displayTypeParameter.list || isSearching
    ? displayTypeParameter.list
    : displayTypeParameter.tree
}

function createTableData({
  tableData,
  branch,
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
            <BranchDirEntry
              name={name}
              branch={branch}
              path={path}
              filters={filters}
            />
          ) : (
            <BranchFileEntry
              name={name}
              path={path}
              branch={branch}
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

export function useRepoBranchContentsTable() {
  const { provider, owner, repo, path, branch } = useParams()
  const { params } = useLocationParams(defaultQueryParams)
  const { treePaths } = useTreePaths()
  const [sortBy, setSortBy] = useTableDefaultSort()

  const { data: repoOverview, isLoadingRepo } = useRepoOverview({
    provider,
    repo,
    owner,
  })

  const { data: branchData, isLoading } = useRepoBranchContents({
    provider,
    owner,
    repo,
    branch: branch || repoOverview?.defaultBranch,
    path: path || '',
    filters: getQueryFilters({ params, sortBy: sortBy[0] }),
    suspense: false,
  })

  const data = useMemo(
    () =>
      createTableData({
        tableData: branchData?.results,
        branch: branch || repoOverview?.defaultBranch,
        path: path || '',
        isSearching: !!params?.search,
        filters: getQueryFilters({ params, sortBy: sortBy[0] }),
        treePaths,
      }),
    [
      branchData,
      branch,
      repoOverview?.defaultBranch,
      path,
      params,
      sortBy,
      treePaths,
    ]
  )

  const handleSort = useCallback(
    (tableSortBy) => {
      if (tableSortBy.length > 0 && !isEqual(sortBy, tableSortBy)) {
        setSortBy(tableSortBy)
      }
    },
    [sortBy, setSortBy]
  )

  return {
    data,
    headers,
    handleSort,
    isLoading: isLoadingRepo || isLoading,
    isSearching: !!params?.search,
    isMissingHeadReport:
      branchData?.__typename === CommitErrorTypes.MISSING_HEAD_REPORT,
  }
}
