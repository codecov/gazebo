import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import cs from 'classnames'
import { useMemo, useState } from 'react'

import { PathContentResultType } from 'services/pathContents/branch/dir/useRepoBranchContents'
import { IndicationRangeType } from 'services/repo/useRepoConfig'
import { OrderingDirection } from 'services/repos'
import { displayTypeParameter } from 'shared/ContentsTable/constants'
import BranchDirEntry from 'shared/ContentsTable/TableEntries/BranchEntries/BranchDirEntry'
import BranchFileEntry from 'shared/ContentsTable/TableEntries/BranchEntries/BranchFileEntry'
import { adjustListIfUpDir } from 'shared/ContentsTable/utils'
import { useTreePaths } from 'shared/treePaths'
import { determineProgressColor } from 'shared/utils/determineProgressColor'
import CoverageProgress from 'ui/CoverageProgress'
import Icon from 'ui/Icon'

import { useRepoBranchContentsTable } from '../hooks'
import { Loader, RepoContentsResult } from '../shared'

const columnHelper = createColumnHelper<PathContentResultType>()

function getOrderingDirection(sorting: Array<{ id: string; desc: boolean }>) {
  const state = sorting.at(0)

  if (state) {
    const direction = state?.desc
      ? OrderingDirection.DESC
      : OrderingDirection.ASC

    let ordering = undefined
    if (state.id === 'name') {
      ordering = 'NAME'
    }

    if (state.id === 'coverage') {
      ordering = 'COVERAGE'
    }

    if (state.id === 'hits') {
      ordering = 'HITS'
    }

    if (state.id === 'misses') {
      ordering = 'MISSES'
    }

    if (state.id === 'partials') {
      ordering = 'PARTIALS'
    }

    if (state.id === 'lines') {
      ordering = 'LINES'
    }

    return { direction, ordering }
  }

  return undefined
}

const getBaseColumns = (
  branch: string,
  urlPath: string,
  indicationRange: IndicationRangeType,
  filters: any
) => {
  const baseColumns = [
    columnHelper.accessor('name', {
      id: 'name',
      header: () => 'Files',
      cell: ({ row, renderValue }) => {
        if (row?.original?.__typename === 'PathContentDir') {
          return (
            <BranchDirEntry
              name={row?.original?.name}
              branch={branch}
              urlPath={urlPath}
              filters={filters}
            />
          )
        }
        if (row?.original?.__typename === 'PathContentFile') {
          return (
            <BranchFileEntry
              name={row?.original?.name}
              urlPath={urlPath}
              branch={branch}
              path={row?.original?.path}
              displayType={displayTypeParameter.tree}
              isCriticalFile={row.original.isCriticalFile}
              filters={filters}
            />
          )
        }
        return renderValue()
      },
    }),
    columnHelper.accessor('lines', {
      id: 'lines',
      header: () => 'Lines',
      cell: ({ renderValue }) => renderValue(),
    }),
    columnHelper.accessor('hits', {
      id: 'hits',
      header: () => 'Covered',
      cell: ({ renderValue }) => renderValue(),
    }),
    columnHelper.accessor('partials', {
      id: 'change',
      header: () => 'Partial',
      cell: ({ renderValue }) => renderValue(),
    }),
    columnHelper.accessor('misses', {
      id: 'misses',
      header: () => 'Missed',
      cell: ({ renderValue }) => renderValue(),
    }),
    columnHelper.accessor('percentCovered', {
      id: 'coverage',
      header: () => 'Coverage %',
      cell: ({ renderValue }) => {
        return (
          <CoverageProgress
            amount={renderValue()}
            color={determineProgressColor({
              coverage: renderValue(),
              ...indicationRange,
            })}
          />
        )
      },
    }),
  ]

  return baseColumns
}

function CodeTreeTable() {
  const [sorting, setSorting] = useState([{ id: 'name', desc: false }])
  const { treePaths } = useTreePaths()
  const ordering = getOrderingDirection(sorting)
  const {
    data,
    isSearching,
    isMissingHeadReport,
    isLoading,
    hasFlagsSelected,
    hasComponentsSelected,
    pathContentsType,
    branch,
    urlPath,
    filters,
  } = useRepoBranchContentsTable(ordering)

  const tableData = useMemo(() => {
    const finalizedTableRows = adjustListIfUpDir({
      treePaths,
      displayType: displayTypeParameter.tree,
      rawTableRows: data?.results,
    })
    return finalizedTableRows ?? []
  }, [data?.results, treePaths])

  const table = useReactTable({
    columns: getBaseColumns(branch, urlPath, data?.indicationRange, filters),
    getCoreRowModel: getCoreRowModel(),
    data: tableData,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
  })

  if (pathContentsType === 'UnknownPath') {
    return (
      <p className="m-4">
        Unknown filepath. Please ensure that files/directories exist and are not
        empty.
      </p>
    )
  }

  if (pathContentsType === 'MissingCoverage') {
    return <p className="m-4">No coverage data available.</p>
  }

  return (
    <div className="z-10 flex flex-col gap-4">
      <div className="tableui">
        <table>
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    colSpan={header.colSpan}
                    scope="col"
                    data-sortable={header.column.getCanSort()}
                    {...{
                      onClick: header.column.getToggleSortingHandler(),
                    }}
                  >
                    <div
                      className={`flex gap-1 ${
                        header.id !== 'name' ? 'flex-row-reverse' : ''
                      }`}
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
                <td colSpan={table.getAllColumns().length}>
                  <Loader />
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className={cs({
                        'flex justify-end': cell.column.id === 'coverage',
                        'text-right':
                          cell.column.id !== 'name' &&
                          cell.column.id !== 'coverage',
                        'w-5/12': cell.column.id === 'name',
                        'w-1/12':
                          cell.column.id !== 'name' &&
                          cell.column.id !== 'coverage',
                      })}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <Loader isLoading={isLoading} />
      {data?.results?.length === 0 && !isLoading ? (
        <RepoContentsResult
          isSearching={isSearching}
          isMissingHeadReport={isMissingHeadReport}
          hasFlagsSelected={hasFlagsSelected}
          hasComponentsSelected={hasComponentsSelected}
        />
      ) : null}
    </div>
  )
}

export default CodeTreeTable
