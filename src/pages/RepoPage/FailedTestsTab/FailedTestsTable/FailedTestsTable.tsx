import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table'
import cs from 'classnames'
import isEmpty from 'lodash/isEmpty'
import { useEffect, useMemo, useState } from 'react'
import { useInView } from 'react-intersection-observer'
import { useParams } from 'react-router-dom'

import { formatTimeToNow } from 'shared/utils/dates'
import Icon from 'ui/Icon'
import Spinner from 'ui/Spinner'

import {
  OrderingDirection,
  OrderingParameter,
  useInfiniteTestResults,
} from '../hooks'

const getDecodedBranch = (branch?: string) =>
  !!branch ? decodeURIComponent(branch) : undefined

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

    let parameter: keyof typeof OrderingParameter =
      OrderingParameter.COMMITS_WHERE_FAIL

    if (state.id === 'avgDuration') {
      parameter = OrderingParameter.AVG_DURATION
    }

    if (state.id === 'failureRate') {
      parameter = OrderingParameter.FAILURE_RATE
    }

    if (state.id === 'commitsFailed') {
      parameter = OrderingParameter.COMMITS_WHERE_FAIL
    }

    if (state.id === 'updatedAt') {
      parameter = OrderingParameter.UPDATED_AT
    }

    return { direction, parameter }
  }

  return undefined
}

const isNumericValue = (value: string) =>
  value === 'avgDuration' ||
  value === 'failureRate' ||
  value === 'commitsFailed'

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
    header: () => 'Test name',
    cell: (info) => info.renderValue(),
  }),
  columnHelper.accessor('avgDuration', {
    header: () => 'Average duration',
    cell: (info) => `${(info.renderValue() ?? 0).toFixed(3)}s`,
  }),
  columnHelper.accessor('failureRate', {
    header: () => 'Failure rate',
    cell: (info) => {
      const value = (info.renderValue() ?? 0) * 100
      const isInt = Number.isInteger(info.renderValue())
      return isInt ? `${value}%` : `${value.toFixed(2)}%`
    },
  }),
  columnHelper.accessor('commitsFailed', {
    header: () => 'Commits failed',
    cell: (info) => (info.renderValue() ? info.renderValue() : 0),
  }),
  columnHelper.accessor('updatedAt', {
    header: () => 'Last run',
    cell: (info) => formatTimeToNow(info.renderValue()),
  }),
]

interface URLParams {
  provider: string
  owner: string
  repo: string
  branch?: string
}

const FailedTestsTable = () => {
  const { ref, inView } = useInView()
  const [sorting, setSorting] = useState<SortingState>([
    {
      id: 'commitsFailed',
      desc: true,
    },
  ])
  const { provider, owner, repo, branch } = useParams<URLParams>()

  const {
    data: testData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteTestResults({
    provider,
    owner,
    repo,
    ordering: getSortingOption(sorting),
    filters: {
      branch: branch ? getDecodedBranch(branch) : undefined,
    },
    opts: {
      suspense: false,
    },
  })

  const tableData = useMemo(() => {
    return testData?.testResults
  }, [testData])

  const table = useReactTable({
    columns,
    data: tableData ?? [],
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    // debugAll: true,
  })

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage()
    }
  }, [fetchNextPage, inView, hasNextPage])

  if (isEmpty(testData?.testResults) && !isLoading && !!branch) {
    return <div>No test results found for this branch</div>
  }

  return (
    <>
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
                    data-sortable={header.column.getCanSort()}
                    onClick={header.column.getToggleSortingHandler()}
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
          <tbody data-testid="failed-tests-table-body">
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
                      {...(isNumericValue(cell.column.id)
                        ? {
                            'data-type': 'numeric',
                          }
                        : {})}
                      className={cs({
                        'text-right': !['name', 'updatedAt'].includes(
                          cell.column.id
                        ),
                        'max-w-1 break-words': cell.column.id === 'name',
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
      {isFetchingNextPage ? <Loader /> : null}
      {hasNextPage ? <LoadMoreTrigger intersectionRef={ref} /> : null}
    </>
  )
}

export default FailedTestsTable
