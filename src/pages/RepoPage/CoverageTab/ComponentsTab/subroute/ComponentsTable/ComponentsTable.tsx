import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  OnChangeFn,
  SortingState,
  useReactTable,
} from '@tanstack/react-table'
import cs from 'classnames'
import { memo, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'

import { useRepoConfig } from 'services/repo/useRepoConfig'
import ComponentsNotConfigured from 'shared/ComponentsNotConfigured'
import { formatTimeToNow } from 'shared/utils/dates'
import { determineProgressColor } from 'shared/utils/determineProgressColor'
import A from 'ui/A'
import CoverageProgress from 'ui/CoverageProgress'
import Icon from 'ui/Icon'
import Spinner from 'ui/Spinner'

import DeleteComponentModal from './DeleteComponentModal'
import useRepoComponentsTable from './hooks'
import TableSparkline from './TableEntries/TableSparkline'

interface ComponentsTableHelper {
  name: React.ReactElement
  coverage: React.ReactElement
  trend: React.ReactElement
  lastUploaded: React.ReactElement
  delete: React.ReactElement | null
}

export const LoadingTable = () => {
  const data = useMemo(() => [], [])
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className="tableui">
      <table>
        <colgroup>
          <col className="@sm/table:w-4/12" />
          <col className="@sm/table:w-3/12" />
          <col className="@sm/table:w-3/12" />
          <col className="@sm/table:w-2/12" />
          <col className="@sm/table:w-3/12" />
        </colgroup>
        <thead data-testid="header-row">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id}>
                  <div
                    className={cs('flex flex-row', {
                      'justify-end':
                        header.id !== 'name' && header.id !== 'lastUploaded',
                    })}
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </div>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          <br />
        </tbody>
      </table>
    </div>
  )
}

const columnHelper = createColumnHelper<ComponentsTableHelper>()

const columns = [
  columnHelper.accessor('name', {
    header: () => 'Components',
    cell: ({ renderValue }) => renderValue(),
  }),
  columnHelper.accessor('coverage', {
    header: () => 'Last aggregated coverage %',
    cell: ({ renderValue }) => renderValue(),
  }),
  columnHelper.accessor('trend', {
    header: () => 'Historical Trend',
    cell: ({ renderValue }) => renderValue(),
  }),
  columnHelper.accessor('lastUploaded', {
    header: () => 'Last Uploaded',
    cell: ({ renderValue }) => renderValue(),
  }),
  columnHelper.accessor('delete', {
    header: () => '',
    cell: ({ renderValue }) => renderValue(),
  }),
]

function createTableData({
  tableData,
  indicationRange,
  setModalInfo,
  isAdmin,
}: {
  tableData: ReturnType<typeof useRepoComponentsTable>['data']
  indicationRange?: { upperRange: number; lowerRange: number } | null
  setModalInfo: (data: any) => void
  isAdmin?: boolean | null
}) {
  if (tableData == null) {
    return []
  }

  const data = tableData?.map(
    ({
      componentId,
      name,
      percentCovered,
      percentChange,
      measurements,
      lastUploaded,
    }: {
      componentId: string
      name: string
      percentCovered: number | null
      percentChange: number | null
      measurements: any[]
      lastUploaded: string | null
    }) => ({
      name: (
        <A
          to={{
            pageName: 'coverage',
            options: { queryParams: { components: [name] } },
          }}
          variant="black"
          isExternal={false}
          hook={'component-to-coverage-page'}
        >
          {name}
        </A>
      ),
      coverage: (
        <div className="flex flex-row">
          <CoverageProgress
            amount={percentCovered}
            color={determineProgressColor({
              coverage: percentCovered,
              lowerRange: indicationRange?.lowerRange || 0,
              upperRange: indicationRange?.upperRange || 100,
            })}
          />
          {typeof percentCovered !== 'number' && (
            <span className="grow text-right font-semibold">-</span>
          )}
        </div>
      ),
      trend: (
        <TableSparkline
          measurements={measurements}
          change={percentChange}
          name={name}
        />
      ),
      lastUploaded: (
        <span className="flex justify-start">
          {lastUploaded ? formatTimeToNow(lastUploaded) : ''}
        </span>
      ),
      delete: isAdmin ? (
        <div className="flex items-center justify-center">
          <button
            data-testid="delete-component"
            onClick={() =>
              setModalInfo({
                componentId: componentId,
                name: name,
                showModal: true,
              })
            }
            className="text-ds-gray-tertiary hover:text-ds-gray-senary"
            aria-label={'delete ' + name}
          >
            <Icon size="md" name="trash" variant="outline" />
          </button>
        </div>
      ) : null,
    })
  )
  return data
}

const Loader = () => (
  <div className="mb-4 flex justify-center pt-4">
    <Spinner />
  </div>
)

const ComponentTable = memo(function Table({
  tableData,
  isLoading,
  sorting,
  setSorting,
}: {
  tableData: ReturnType<typeof createTableData>
  isLoading: boolean
  sorting?: SortingState
  setSorting?: OnChangeFn<SortingState> | undefined
}) {
  const table = useReactTable({
    data: tableData,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  return (
    <div className="tableui">
      <table>
        <colgroup>
          <col className="@sm/table:w-4/12" />
          <col className="@sm/table:w-3/12" />
          <col className="@sm/table:w-3/12" />
          <col className="@sm/table:w-2/12" />
          <col className="@sm/table:w-3/12" />
        </colgroup>
        <thead data-testid="header-row">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  data-sortable={header.column.getCanSort()}
                  {...{
                    onClick:
                      header.column.id === 'name'
                        ? header.column.getToggleSortingHandler()
                        : undefined,
                  }}
                >
                  <div
                    className={cs('flex flex-row', {
                      'justify-end':
                        header.id !== 'name' && header.id !== 'lastUploaded',
                    })}
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                    {header.id === 'name' ? (
                      <span
                        className="text-ds-blue-darker group-hover/columnheader:opacity-100"
                        data-sort-direction={header.column.getIsSorted()}
                      >
                        <Icon name="arrowUp" size="sm" />
                      </span>
                    ) : null}
                  </div>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody data-testid="body-row">
          {isLoading ? (
            <tr>
              <td colSpan={table.getAllColumns().length}>
                <Loader />
              </td>
            </tr>
          ) : (
            table.getRowModel().rows.map((row) => (
              <tr key={row.id} data-testid={`row-${row.id}`}>
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))
          )}
          {
            /* Adds an extra line beneath the header row for the special case that the table is empty  */
            !tableData.length ? <br /> : null
          }
        </tbody>
      </table>
    </div>
  )
})

type URLParams = {
  provider: string
  owner: string
  repo: string
}

function ComponentsTable() {
  const { provider, owner, repo } = useParams<URLParams>()
  const { data: repoConfigData } = useRepoConfig({ provider, owner, repo })
  const [modalInfo, setModalInfo] = useState({
    componentId: null,
    name: null,
    showModal: false,
  })
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'name', desc: true },
  ])
  const indicationRange = repoConfigData?.indicationRange

  const { data, isAdmin, isLoading, isSearching } = useRepoComponentsTable(
    sorting[0]?.desc
  )

  const tableData = useMemo(() => {
    return createTableData({
      isAdmin,
      tableData: data,
      indicationRange,
      setModalInfo,
    })
  }, [data, isAdmin, indicationRange])

  return (
    <>
      <DeleteComponentModal
        componentId={modalInfo?.componentId || ''}
        name={modalInfo?.name || ''}
        closeModal={() => {
          setModalInfo({ componentId: null, name: null, showModal: false })
        }}
        isOpen={modalInfo?.showModal}
      />
      <ComponentTable
        tableData={tableData}
        isLoading={isLoading}
        sorting={sorting}
        setSorting={setSorting}
      />
      {!tableData?.length && !isLoading && (
        <p className="flex flex-1 justify-center">
          {isSearching ? 'No results found' : <ComponentsNotConfigured />}
        </p>
      )}
    </>
  )
}
export default ComponentsTable
