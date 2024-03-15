import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import cs from 'classnames'
import isEmpty from 'lodash/isEmpty'
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
  name: string
  lowerRange: number
  upperRange: number
  coverage: number | null
  percentChange: number
  measurements: any[]
  delete: false | JSX.Element | null | undefined
}

const columnHelper = createColumnHelper<FlagsTableHelper>()

const columns = [
  columnHelper.accessor('name', {
    id: 'name',
    header: () => 'Flags',
    cell: ({ renderValue }) => (
      <A
        to={{
          pageName: 'coverage',
          options: { queryParams: { flags: [renderValue()] } },
        }}
        variant="black"
        isExternal={false}
        hook={'flag-to-coverage-page'}
      >
        {renderValue()}
      </A>
    ),
  }),
  columnHelper.accessor('coverage', {
    id: 'coverage',
    header: () => 'Coverage %',
    cell: ({ renderValue, row }) => (
      <>
        <CoverageProgress
          amount={renderValue()}
          color={determineProgressColor({
            coverage: renderValue(),
            lowerRange: row.original.lowerRange,
            upperRange: row.original.upperRange,
          })}
        />
        {typeof renderValue() !== 'number' && (
          <span className="grow text-right font-semibold">-</span>
        )}
      </>
    ),
  }),
  columnHelper.accessor('percentChange', {
    id: 'percentChange',
    header: () => 'Trend',
    cell: ({ row }) => (
      <TableSparkline
        measurements={row.original.measurements}
        change={row.original.percentChange}
        name={row.original.name}
      />
    ),
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
  tableData: any[]
  indicationRange?: { upperRange: number; lowerRange: number } | null
  setModalInfo: (data: any) => void
  isAdmin?: boolean | null
}) {
  return tableData?.length > 0
    ? tableData?.map(
        ({
          name,
          percentCovered,
          percentChange,
          measurements,
        }: {
          name: string
          percentCovered: number | null
          percentChange: number
          measurements: any[]
        }) => ({
          name: name,
          lowerRange: indicationRange?.lowerRange || 0,
          upperRange: indicationRange?.upperRange || 100,
          coverage: percentCovered,
          measurements,
          percentChange,
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
    : []
}

const getEmptyStateText = ({ isSearching }: { isSearching: boolean }) =>
  isSearching ? 'No results found' : 'There was a problem getting flags data'

const Loader = () => (
  <div className="mb-4 flex justify-center pt-4">
    <Spinner />
  </div>
)

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

  const indicationRange = repoConfigData?.indicationRange

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
        tableData: data!,
        indicationRange,
        setModalInfo,
      }),
    [data, indicationRange, isAdmin]
  )

  const table = useReactTable({
    columns,
    data: tableData,
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
            <col className="@sm/table:w-3/12" />
            <col className="@sm/table:w-3/12" />
            <col className="@sm/table:w-1/12" />
          </colgroup>
          <thead data-testid="header-row">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className={cs({ 'text-right': header.id !== 'name' })}
                    data-sortable={header.column.getCanSort()}
                  >
                    <div>
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
          <tbody data-testid="body-row">
            {isLoading ? (
              <tr>
                <td>
                  <Loader />
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
      {isEmpty(tableData) && !isLoading && (
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
