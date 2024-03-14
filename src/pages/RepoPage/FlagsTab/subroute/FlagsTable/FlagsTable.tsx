import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'

import { useRepoConfig } from 'services/repo/useRepoConfig'
import { determineProgressColor } from 'shared/utils/determineProgressColor'
import A from 'ui/A'
import Button from 'ui/Button'
import CoverageProgress from 'ui/CoverageProgress'
import Icon from 'ui/Icon'
import Spinner from 'ui/Spinner'

import DeleteFlagModal from './DeleteFlagModal'
import useRepoFlagsTable from './hooks'
import TableSparkline from './TableEntries/TableSparkline'

import 'ui/Table/Table.css'

interface FlagsTableHelper {
  name: React.ReactElement
  coverage: React.ReactElement
  trend: React.ReactElement
  delete: React.ReactElement
}

const columnHelper = createColumnHelper<FlagsTableHelper>()

const columns = [
  columnHelper.accessor('name', {
    id: 'name',
    header: () => 'Flags',
    cell: ({ renderValue }) => renderValue(),
  }),
  columnHelper.accessor('coverage', {
    id: 'coverage',
    header: () => 'Coverage %',
    cell: ({ renderValue }) => renderValue(),
  }),
  columnHelper.accessor('trend', {
    id: 'trend',
    header: () => 'Trend',
    cell: ({ renderValue }) => renderValue(),
  }),
  columnHelper.accessor('delete', {
    id: 'delete',
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
  tableData?: any[]
  indicationRange?: { upperRange: number; lowerRange: number } | null
  setModalInfo: any
  isAdmin?: boolean | null
}) {
  if (!tableData) {
    return []
  }

  return tableData.map(
    ({
      name,
      percentCovered,
      percentChange,
      measurements,
    }: {
      name: string
      percentCovered: number
      percentChange: number
      measurements: any[]
    }) => ({
      name: (
        <A
          to={{
            pageName: 'coverage',
            options: { queryParams: { flags: [name] } },
          }}
          variant="black"
          isExternal={false}
          hook={'flag-to-coverage-page'}
        >
          {name}
        </A>
      ),
      coverage: (
        <>
          <CoverageProgress
            amount={percentCovered}
            // @ts-expect-error
            color={determineProgressColor({
              coverage: percentCovered,
              ...indicationRange,
            })}
          />
          {typeof percentCovered != 'number' && (
            <span className="grow text-right font-semibold">-</span>
          )}
        </>
      ),
      trend: (
        <TableSparkline
          measurements={measurements}
          change={percentChange}
          name={name}
        />
      ),
      delete: isAdmin && (
        <button
          data-testid="delete-flag"
          onClick={() => setModalInfo({ flagName: name, showModal: true })}
          className="text-ds-gray-tertiary hover:text-ds-gray-senary"
        >
          <Icon size="md" name="trash" variant="outline" />
        </button>
      ),
    })
  )
}

const getEmptyStateText = ({ isSearching }: { isSearching: boolean }) =>
  isSearching ? 'No results found' : 'There was a problem getting flags data'

type URLParams = {
  provider: string
  owner: string
  repo: string
}

function FlagsTable() {
  const { provider, owner, repo } = useParams<URLParams>()
  const { data: repoConfigData } = useRepoConfig({ provider, owner, repo })
  const [modalInfo, setModalInfo] = useState({
    flagName: null,
    showModal: false,
  })

  const {
    data,
    isAdmin,
    isLoading,
    // handleSort,
    isSearching,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useRepoFlagsTable()

  const tableData = useMemo(
    () =>
      createTableData({
        isAdmin,
        tableData: data,
        indicationRange: repoConfigData?.indicationRange,
        setModalInfo,
      }),
    [data, repoConfigData, isAdmin]
  )

  const [sorting, setSorting] = useState([{ id: 'change', desc: true }])

  const table = useReactTable({
    // @ts-expect-error
    columns,
    data: tableData,
    onSortingChange: setSorting,
    state: {
      sorting,
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  return (
    <>
      <DeleteFlagModal
        flagName={modalInfo?.flagName || ''}
        closeModal={() => {
          setModalInfo({ flagName: null, showModal: false })
        }}
        isOpen={modalInfo?.showModal}
      />
      <div className="tableui">
        <table>
          <colgroup>
            <col className="w-full @sm/table:w-4/12" />
            <col className="@sm/table:w-4/12" />
            <col className="@sm/table:w-4/12" />
            <col className="@sm/table:w-1/12" />
          </colgroup>
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    data-sortable={header.column.getCanSort()}
                  >
                    <div>
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
                <td>
                  <Spinner />
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id}>
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
      {tableData?.length === 0 && !isLoading && (
        <p className="flex flex-1 justify-center">
          {getEmptyStateText({ isSearching })}
        </p>
      )}
      {hasNextPage && (
        <div className="mt-4 flex flex-1 justify-center">
          <Button
            disabled={false}
            to={undefined}
            hook="load-more"
            isLoading={isFetchingNextPage}
            onClick={fetchNextPage}
          >
            Load More
          </Button>
        </div>
      )}
    </>
  )
}
export default FlagsTable
