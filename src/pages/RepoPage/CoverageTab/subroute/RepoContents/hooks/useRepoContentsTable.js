import isEqual from 'lodash/isEqual'
import { useCallback, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'

import { useLocationParams } from 'services/navigation'
import { useRepoContents, useRepoOverview } from 'services/repo'
import { usePaginatedContents } from 'services/usePaginatedContents'
import { CommitErrorTypes } from 'shared/utils/commit'
import { SortingDirection } from 'ui/Table/constants'

import { displayTypeParameter } from '../../../constants'
import CoverageEntry from '../TableEntries/CoverageEntry'
import DirEntry from '../TableEntries/DirEntry'
import FileEntry from '../TableEntries/FileEntry'

function createTableData({ tableData, branch, path, isSearching, filters }) {
  const displayType =
    filters?.displayType === displayTypeParameter.list || isSearching
      ? displayTypeParameter.list
      : displayTypeParameter.tree
  return tableData?.length > 0
    ? tableData.map(
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
              <DirEntry
                branch={branch}
                name={name}
                path={path}
                filters={filters}
              />
            ) : (
              <FileEntry
                name={name}
                path={path}
                branch={branch}
                filePath={filePath}
                displayType={displayType}
                isCriticalFile={isCriticalFile}
              />
            ),
          lines: (
            <div className="flex w-full justify-end font-lato">{lines}</div>
          ),
          misses: (
            <div className="flex w-full justify-end font-lato">{misses}</div>
          ),
          hits: <div className="flex w-full justify-end font-lato">{hits}</div>,
          partials: (
            <div className="flex w-full justify-end font-lato">{partials}</div>
          ),
          coverage: (
            <span className="font-lato w-full">
              <CoverageEntry percentCovered={percentCovered} />
            </span>
          ),
        })
      )
    : []
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
    header: 'file coverage %',
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

function useRepoContentsTable() {
  const { provider, owner, repo, path, branch } = useParams()
  const { params } = useLocationParams(defaultQueryParams)

  const [sortBy, setSortBy] = useState([])

  const { data: repoOverview, isLoadingRepo } = useRepoOverview({
    provider,
    repo,
    owner,
  })
  const isSearching = Boolean(params?.search)

  const { data: pathContentData, isLoading } = useRepoContents({
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
        tableData: pathContentData?.results,
        branch: branch || repoOverview?.defaultBranch,
        path: path || '',
        isSearching,
        filters: getQueryFilters({ params, sortBy: sortBy[0] }),
      }),
    [
      pathContentData?.results,
      branch,
      repoOverview?.defaultBranch,
      path,
      isSearching,
      params,
      sortBy,
    ]
  )

  const { paginatedData, handlePaginationClick, hasNextPage } =
    usePaginatedContents({ data })

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
    paginatedData,
    headers,
    handleSort,
    isLoading: isLoadingRepo || isLoading,
    isSearching,
    handlePaginationClick,
    hasNextPage,
    isMissingHeadReport:
      pathContentData?.__typename === CommitErrorTypes.MISSING_HEAD_REPORT,
  }
}

export default useRepoContentsTable
