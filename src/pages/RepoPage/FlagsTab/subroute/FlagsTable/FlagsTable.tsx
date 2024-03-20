/* eslint-disable max-nested-callbacks */
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
import { memo, useEffect, useMemo, useState } from 'react'
import { useInView } from 'react-intersection-observer'
import { useParams } from 'react-router-dom'

import { useRepoConfig } from 'services/repo/useRepoConfig'
import { determineProgressColor } from 'shared/utils/determineProgressColor'
import A from 'ui/A'
import CoverageProgress from 'ui/CoverageProgress'
import Icon from 'ui/Icon'
import Spinner from 'ui/Spinner'

import DeleteFlagModal from './DeleteFlagModal'
import useRepoFlagsTable from './hooks'
import TableSparkline from './TableEntries/TableSparkline'

import 'ui/Table/Table.css'

interface FlagsTableHelper {
  name: JSX.Element
  coverage: JSX.Element
  trend: JSX.Element
  delete: JSX.Element | null
}

const columnHelper = createColumnHelper<FlagsTableHelper>()

const columns = [
  columnHelper.accessor('name', {
    header: () => 'Flags',
    cell: ({ renderValue }) => renderValue(),
  }),
  columnHelper.accessor('coverage', {
    header: () => 'Coverage %',
    cell: ({ renderValue }) => renderValue(),
  }),
  columnHelper.accessor('trend', {
    header: () => 'Trend',
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
  tableData: any[] | null // TODO: update type when we convert useRepoFlags to TS
  indicationRange?: { upperRange: number; lowerRange: number } | null
  setModalInfo: (data: any) => void
  isAdmin?: boolean | null
}) {
  if (tableData === null) {
    return []
  }

  const data = tableData.map(
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
      delete: true ? (
        <div className="flex items-center justify-center">
          <button
            data-testid="delete-flag"
            onClick={() => setModalInfo({ flagName: name, showModal: true })}
            className="text-ds-gray-tertiary hover:text-ds-gray-senary"
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

const FlagTable = memo(function Table({
  tableData,
  isLoading,
  sorting,
  setSorting,
}: {
  tableData: any[] // TODO: update type when we convert useRepoFlags to TS
  isLoading: boolean
  sorting?: SortingState
  setSorting?: OnChangeFn<SortingState> | undefined
}) {
  const table = useReactTable({
    columns,
    data: tableData,
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
          <col className="@sm/table:w-4/12" />
          <col className="@sm/table:w-4/12" />
          <col className="@sm/table:w-1/12" />
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
                      'justify-end': header.id !== 'name',
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
        </tbody>
      </table>
    </div>
  )
})

function LoadMoreTrigger({
  intersectionRef,
}: {
  intersectionRef: React.Ref<HTMLSpanElement>
}) {
  return (
    <span
      ref={intersectionRef}
      data-testId={'Loading'}
      className="invisible relative top-[-65px] block leading-[0]"
    >
      Loading
    </span>
  )
}

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
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'name', desc: true },
  ])
  const { ref, inView } = useInView()

  const indicationRange = repoConfigData?.indicationRange

  const {
    data,
    isAdmin,
    isLoading,
    isSearching,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useRepoFlagsTable(sorting[0]?.desc)

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage()
    }
  }, [inView, hasNextPage, fetchNextPage])

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
      <DeleteFlagModal
        flagName={modalInfo?.flagName || ''}
        closeModal={() => {
          setModalInfo({ flagName: null, showModal: false })
        }}
        isOpen={modalInfo?.showModal}
      />
      <FlagTable
        tableData={tableData}
        isLoading={isLoading}
        sorting={sorting}
        setSorting={setSorting}
      />
      {!tableData?.length && !isLoading && (
        <p className="flex flex-1 justify-center">
          {isSearching
            ? 'No results found'
            : 'There was a problem getting flags data'}
        </p>
      )}
      {isFetchingNextPage ? <Loader /> : null}
      {hasNextPage ? <LoadMoreTrigger intersectionRef={ref} /> : null}
    </>
  )
}
export default FlagsTable
