import type { SortingState } from '@tanstack/react-table'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import cs from 'classnames'
import { useEffect, useMemo, useState } from 'react'
import { useInView } from 'react-intersection-observer'
import { useParams } from 'react-router-dom'

import { OrderingDirection } from 'services/repos'
import Icon from 'ui/Icon'
import Spinner from 'ui/Spinner'

import { useInfiniteTestResults } from '../hooks'

const Loader = () => (
  <div className="mt-16 flex flex-1 items-center justify-center">
    <Spinner />
  </div>
)

function LoadMoreTrigger({
  intersectionRef,
}: {
  intersectionRef: React.Ref<HTMLSpanElement>
}) {
  return (
    <span
      ref={intersectionRef}
      className="invisible relative top-[-65px] block leading-[0]"
    >
      Loading
    </span>
  )
}

export function getSortingOption(
  sorting: Array<{ id: string; desc: boolean }>
) {
  const state = sorting[0]

  if (state) {
    const direction = state.desc
      ? OrderingDirection.DESC
      : OrderingDirection.ASC

    let ordering
    if (state.id === 'testName') {
      ordering = 'NAME'
    }

    if (state.id === 'lastDuration') {
      ordering = 'LAST DURATION'
    }

    if (state.id === 'failureRate') {
      ordering = 'FAILURE RATE'
    }

    if (state.id === 'commitsFailed') {
      ordering = 'COMMITS FAILED'
    }

    if (state.id === 'updatedAt') {
      ordering = 'LAST RUN'
    }

    return { direction, ordering }
  }

  return undefined
}

interface FailedTestsColumns {
  name: string
  avgDuration: number | null
  failureRate: number | null
  commitsFailed: number | null
  updatedAt: string
}

const columnHelper = createColumnHelper<FailedTestsColumns>()

const columns = [
  columnHelper.accessor('name', {
    header: 'Test name',
    cell: (info) => info.renderValue(),
  }),
  columnHelper.accessor('avgDuration', {
    header: 'Average duration',
    cell: (info) => info.renderValue(),
  }),
  columnHelper.accessor('failureRate', {
    header: 'Failure rate',
    cell: (info) => info.renderValue(),
  }),
  columnHelper.accessor('commitsFailed', {
    header: 'Commits failed',
    cell: (info) => info.renderValue(),
  }),
  columnHelper.accessor('updatedAt', {
    header: 'Last run',
    cell: (info) => info.renderValue(),
  }),
]

interface URLParams {
  provider: string
  owner: string
  repo: string
}

const FailedTestsTable = () => {
  const { ref, inView } = useInView()
  const [sorting, setSorting] = useState<SortingState>([
    {
      id: 'commitsFailed',
      desc: true,
    },
  ])
  const { provider, owner, repo } = useParams<URLParams>()

  const {
    data: testData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteTestResults({
    provider,
    owner,
    repo,
  })

  const tableData = useMemo(() => {
    const data = testData.testResults
    return data ?? []
  }, [testData])

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

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage()
    }
  }, [fetchNextPage, inView, hasNextPage])

  const isLoading = false

  return (
    <div className="tableui">
      <table>
        <colgroup>
          <col className="w-full @sm/table:w-5/12" />
          <col className="@sm/table:w-1/12" />
          <col className="@sm/table:w-1/12" />
          <col className="@sm/table:w-1/12" />
          <col className="@sm/table:w-1/12" />
        </colgroup>
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  colSpan={header.colSpan}
                  scope="col"
                  className="text-right"
                  data-sortable={header.column.getCanSort()}
                  {...{ onClick: header.column.getToggleSortingHandler() }}
                >
                  <div
                    className={cs('flex gap-1', {
                      'flex-row-reverse': !['name', 'updatedAt'].includes(
                        header.id
                      ),
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
              <td>
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
                      'text-right': !['name', 'updatedAt'].includes(
                        cell.column.id
                      ),
                    })}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
      {isFetchingNextPage ? <Loader /> : null}
      {hasNextPage ? <LoadMoreTrigger intersectionRef={ref} /> : null}
    </div>
  )
}

export default FailedTestsTable
