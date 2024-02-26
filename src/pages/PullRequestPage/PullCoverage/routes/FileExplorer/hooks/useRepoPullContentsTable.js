import isEqual from 'lodash/isEqual'
import qs from 'qs'
import { useCallback, useMemo } from 'react'
import { useLocation, useParams } from 'react-router-dom'

import { SortingDirection } from 'old_ui/Table/constants'
import { useLocationParams } from 'services/navigation'
import { useRepoPullContents } from 'services/pathContents/pull/dir'
import { displayTypeParameter } from 'shared/ContentsTable/constants'
import PullDirEntry from 'shared/ContentsTable/TableEntries/PullEntries/PullDirEntry'
import PullFileEntry from 'shared/ContentsTable/TableEntries/PullEntries/PullFileEntry'
import { useTableDefaultSort } from 'shared/ContentsTable/useTableDefaultSort'
import { adjustListIfUpDir } from 'shared/ContentsTable/utils'
import { usePullTreePaths } from 'shared/treePaths'
import { determineProgressColor } from 'shared/utils/determineProgressColor'
import CoverageProgress from 'ui/CoverageProgress'

function determineDisplayType({ filters, isSearching }) {
  return filters?.displayType === displayTypeParameter.list || isSearching
    ? displayTypeParameter.list
    : displayTypeParameter.tree
}

function createTableData({
  tableData,
  pullId,
  commitSha,
  urlPath,
  isSearching,
  filters,
  treePaths,
  indicationRange,
}) {
  if (tableData?.length > 0) {
    const displayType = determineDisplayType({ filters, isSearching })

    const rawTableRows = tableData?.map(
      ({
        name,
        percentCovered,
        __typename,
        path,
        isCriticalFile,
        misses,
        partials,
        hits,
        lines,
      }) => ({
        name:
          __typename === 'PathContentDir' ? (
            <PullDirEntry
              name={name}
              pullId={pullId}
              urlPath={urlPath}
              filters={filters}
            />
          ) : (
            <PullFileEntry
              commitSha={commitSha}
              name={name}
              pullId={pullId}
              urlPath={urlPath}
              path={path}
              displayType={displayType}
              isCriticalFile={isCriticalFile}
            />
          ),
        lines,
        misses,
        hits,
        partials,
        coverage: (
          <CoverageProgress
            amount={percentCovered}
            color={determineProgressColor({
              coverage: percentCovered,
              ...indicationRange,
            })}
          />
        ),
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

const getQueryFilters = ({ params, sortBy, flags, components }) => {
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
    ...(flags ? { flags } : {}),
    ...(components ? { components } : {}),
  }
}

export function useRepoPullContentsTable() {
  const { provider, owner, repo, path: urlPath, pullId } = useParams()
  const location = useLocation()
  const queryParams = qs.parse(location.search, {
    ignoreQueryPrefix: true,
    depth: 1,
  })
  const flags = queryParams?.flags
  const components = queryParams?.components

  const { params } = useLocationParams(defaultQueryParams)
  const { treePaths } = usePullTreePaths()
  const [sortBy, setSortBy] = useTableDefaultSort()

  const { data: pullData, isLoading: pullIsLoading } = useRepoPullContents({
    provider,
    owner,
    repo,
    pullId,
    path: urlPath || '',
    filters: getQueryFilters({ params, sortBy: sortBy[0], flags, components }),
    opts: {
      suspense: false,
    },
  })

  const data = useMemo(
    () =>
      createTableData({
        tableData: pullData?.results,
        pullId,
        commitSha: pullData?.commitid,
        urlPath: urlPath || '',
        isSearching: !!params?.search,
        filters: getQueryFilters({ params, sortBy: sortBy[0], flags }),
        treePaths,
        indicationRange: pullData?.indicationRange,
      }),
    [pullData, urlPath, params, sortBy, treePaths, pullId, flags]
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
    pathContentsType: pullData?.pathContentsType,
    isLoading: pullIsLoading,
    isSearching: !!params?.search,
  }
}
