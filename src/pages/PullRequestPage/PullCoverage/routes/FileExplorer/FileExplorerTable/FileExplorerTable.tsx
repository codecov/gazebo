import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import cs from 'classnames'
import isArray from 'lodash/isArray'
import isString from 'lodash/isString'
import qs, { ParsedQs } from 'qs'
import { ReactNode, useMemo } from 'react'
import 'ui/Table/Table.css'
import { useLocation, useParams } from 'react-router-dom'

import {
  PathContentsFilters,
  toPathContentsFilterParameter,
} from 'services/pathContents/constants'
import {
  PathContentDir,
  PathContentFile,
  useRepoPullContents,
} from 'services/pathContents/pull/dir'
import { displayTypeParameter } from 'shared/ContentsTable/constants'
import MissingFileData from 'shared/ContentsTable/MissingFileData'
import PullDirEntry from 'shared/ContentsTable/TableEntries/PullEntries/PullDirEntry'
import PullFileEntry from 'shared/ContentsTable/TableEntries/PullEntries/PullFileEntry'
import { useTableDefaultSort } from 'shared/ContentsTable/useTableDefaultSort'
import { adjustListIfUpDir } from 'shared/ContentsTable/utils'
import { usePullTreePaths } from 'shared/treePaths'
import { determineProgressColor } from 'shared/utils/determineProgressColor'
import CoverageProgress from 'ui/CoverageProgress'
import Icon from 'ui/Icon'
import Spinner from 'ui/Spinner'

interface URLParams {
  provider: string
  owner: string
  repo: string
  path: string
  pullId: string
}

interface FileExplorerColumn {
  name: ReactNode
  lines: string
  hits: string
  partials: string
  misses: string
  coverage: ReactNode
}

const columnHelper = createColumnHelper<FileExplorerColumn>()

const columns = [
  columnHelper.accessor('name', {
    header: 'Files',
    cell: (info) => info.renderValue(),
  }),
  columnHelper.accessor('lines', {
    header: 'Tracked lines',
    cell: (info) => info.renderValue(),
  }),
  columnHelper.accessor('hits', {
    header: 'Covered',
    cell: (info) => info.renderValue(),
  }),
  columnHelper.accessor('partials', {
    header: 'Partial',
    cell: (info) => info.renderValue(),
  }),
  columnHelper.accessor('misses', {
    header: 'Missed',
    cell: (info) => info.renderValue(),
  }),
  columnHelper.accessor('coverage', {
    header: 'Coverage %',
    cell: (info) => info.renderValue(),
  }),
]

function useTableData() {
  const {
    provider,
    owner,
    repo,
    path: urlPath,
    pullId,
  } = useParams<URLParams>()
  const location = useLocation()
  const { treePaths } = usePullTreePaths()
  const [sortBy, setSortBy] = useTableDefaultSort()

  const { flags, components, search, displayType } = useMemo(() => {
    const queryParams = qs.parse(location.search, {
      ignoreQueryPrefix: true,
      depth: 1,
    })

    let flags: string[] | ParsedQs[] | undefined
    if (isArray(queryParams?.flags) && queryParams?.flags?.length) {
      flags = queryParams.flags
    }
    let components: string[] | ParsedQs[] | undefined
    if (isArray(queryParams?.components) && queryParams?.components?.length) {
      components = queryParams.components
    }
    let search: string = ''
    if (isString(queryParams?.search)) {
      search = queryParams.search
    }
    let displayType: 'tree' | 'list' | undefined
    if (
      isString(queryParams?.displayType) &&
      (queryParams.displayType === 'tree' || queryParams.displayType === 'list')
    ) {
      displayType = queryParams.displayType
    }

    return {
      flags,
      components,
      search,
      displayType,
    }
  }, [location.search])

  const filters = useMemo<PathContentsFilters>(
    () => ({
      searchValue: search,
      displayType: displayType
        ? displayTypeParameter[displayType]
        : displayTypeParameter.tree,
      ordering:
        sortBy.length && sortBy[0]?.id
          ? {
              direction: sortBy[0]?.desc ? 'DESC' : 'ASC',
              parameter: toPathContentsFilterParameter(sortBy[0].id),
            }
          : undefined,
      flags,
      components,
    }),
    [sortBy, flags, components, search, displayType]
  )

  const { data: pullData, isLoading } = useRepoPullContents({
    provider,
    owner,
    repo,
    pullId,
    path: urlPath || '',
    filters,
    opts: {
      suspense: false,
    },
  })

  const data = useMemo(() => {
    const tableData = pullData?.results

    if (!tableData?.length) {
      return []
    }

    const rawTableRows: FileExplorerColumn[] = tableData.map(
      (file: PathContentFile | PathContentDir) => ({
        name:
          file.__typename === 'PathContentDir' ? (
            <PullDirEntry
              name={file.name}
              pullId={pullId}
              urlPath={urlPath}
              filters={filters}
            />
          ) : (
            <PullFileEntry
              commitSha={pullData?.commitid || ''}
              name={file.name}
              urlPath={urlPath}
              path={file.path || ''}
              displayType={
                filters?.displayType === displayTypeParameter.list ||
                filters?.searchValue
                  ? displayTypeParameter.list
                  : displayTypeParameter.tree
              }
              isCriticalFile={file.isCriticalFile}
            />
          ),
        lines: file.lines.toString(),
        hits: file.hits.toString(),
        partials: file.partials.toString(),
        misses: file.misses.toString(),
        coverage: (
          <CoverageProgress
            amount={file.percentCovered}
            color={determineProgressColor({
              coverage: file.percentCovered,
              ...(pullData?.indicationRange || {
                upperRange: 80,
                lowerRange: 60,
              }),
            })}
          />
        ),
      })
    )
    return adjustListIfUpDir({
      treePaths,
      displayType: filters?.displayType || displayTypeParameter.tree,
      rawTableRows,
    })
  }, [pullData, filters, treePaths, pullId, urlPath])

  return {
    data,
    pathContentsType: pullData?.pathContentsType,
    isLoading,
    isSearching: !!search,
    hasFlagsSelected: !!flags && flags.length > 0,
    hasComponentsSelected: !!components && components.length > 0,
    sortBy,
    setSortBy,
  }
}

function FileExplorerTable() {
  const {
    data,
    pathContentsType,
    isLoading,
    isSearching,
    hasFlagsSelected,
    hasComponentsSelected,
    sortBy,
    setSortBy,
  } = useTableData()
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    state: {
      sorting: sortBy,
    },
    onSortingChange: setSortBy,
    manualSorting: true,
  })

  if (pathContentsType === 'UnknownPath') {
    return (
      <p className="flex flex-1 justify-center">
        Unknown filepath. Please ensure that files/directories exist and are not
        empty.
      </p>
    )
  }

  if (
    pathContentsType === 'MissingCoverage' ||
    pathContentsType === 'MissingHeadReport'
  ) {
    return (
      <p className="flex flex-1 justify-center">No coverage data available.</p>
    )
  }

  if (data?.length === 0 && !isLoading) {
    return (
      <MissingFileData
        isSearching={isSearching}
        hasFlagsSelected={hasFlagsSelected}
        hasComponentsSelected={hasComponentsSelected}
      />
    )
  }

  return (
    <div className="tableui">
      <table>
        <colgroup>
          <col className="w-full @sm/table:w-5/12" />
          <col className="@sm/table:w-1/12" />
          <col className="@sm/table:w-1/12" />
          <col className="@sm/table:w-1/12" />
          <col className="@sm/table:w-1/12" />
          <col className="@sm/table:w-3/12" />
        </colgroup>
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  data-sortable={header.column.getCanSort()}
                  {...{
                    onClick: header.column.getToggleSortingHandler(),
                  }}
                >
                  <div
                    className={cs('flex gap-1 items-center', {
                      'flex-row-reverse': header.id !== 'name',
                    })}
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                    <span
                      className="text-ds-blue-darker group-hover/columnheader:opacity-100"
                      data-sort-direction={header.column.getIsSorted()}
                    >
                      <Icon name="arrowUp" size="sm" />
                    </span>
                  </div>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td colSpan={columns.length}>
                <div className="mb-4 flex justify-center pt-4">
                  <Spinner />
                </div>
              </td>
            </tr>
          ) : (
            table.getRowModel().rows.map((row) => (
              <tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id}>
                    <div
                      className={cs('flex', {
                        'flex-row-reverse': cell.column.id !== 'name',
                        'font-lato':
                          cell.column.id !== 'name' &&
                          cell.column.id !== 'coverage',
                      })}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </div>
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}

export default FileExplorerTable
