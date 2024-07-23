import type { SortingState } from '@tanstack/react-table'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import cs from 'classnames'
import { useState } from 'react'
// import { useInView } from 'react-intersection-observer'
// import { useParams } from 'react-router-dom'

import { OrderingDirection } from 'services/repos'
import Icon from 'ui/Icon'
import Spinner from 'ui/Spinner'

const Loader = () => (
  <div className="mt-16 flex flex-1 items-center justify-center">
    <Spinner />
  </div>
)

// function LoadMoreTrigger({
//   intersectionRef,
// }: {
//   intersectionRef: React.Ref<HTMLSpanElement>
// }) {
//   return (
//     <span
//       ref={intersectionRef}
//       className="invisible relative top-[-65px] block leading-[0]"
//     >
//       Loading
//     </span>
//   )
// }

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
  avgDuration: number
  failureRate: number
  commitsFailed: number
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

const FailedTestsTable = () => {
  // const { ref, inView } = useInView()
  const [sorting, setSorting] = useState<SortingState>([
    {
      id: 'commitsFailed',
      desc: true,
    },
  ])
  // const { owner } = useParams<{ owner: string }>()

  // const {
  //   data: reposData,
  //   fetchNextPage,
  //   hasNextPage,
  //   isFetching,
  //   isFetchingNextPage,
  // } = useReposTeam({
  //   activated: false,
  //   sortItem: getSortingOption(sorting),
  //   owner,
  // })

  // const tableData = useMemo(() => {
  //   const data = reposData?.pages?.map((page) => page?.repos).flat()
  //   return data ?? []
  // }, [reposData?.pages])

  const table = useReactTable({
    columns,
    data: [
      {
        name: 'blah',
        avgDuration: 123,
        failureRate: 1,
        commitsFailed: 4,
        updatedAt: '2021-01-01',
      },
      {
        name: 'cool',
        avgDuration: 123,
        failureRate: 2,
        commitsFailed: 3,
        updatedAt: '2022-01-01',
      },
      {
        name: 'rad guy',
        avgDuration: 123,
        failureRate: 3,
        commitsFailed: 2,
        updatedAt: '2023-01-01',
      },
      {
        name: 'awww ok',
        avgDuration: 123,
        failureRate: 4,
        commitsFailed: 1,
        updatedAt: '2024-01-01',
      },
    ],
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  // useEffect(() => {
  //   if (inView && hasNextPage) {
  //     fetchNextPage()
  //   }
  // }, [fetchNextPage, inView, hasNextPage])

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
                  data-sortable={header.column.getCanSort()}
                  {...{ onClick: header.column.getToggleSortingHandler() }}
                >
                  <div className={'flex gap-1'}>
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                    <span
                      className="text-right text-ds-blue-darker group-hover/columnheader:opacity-100"
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
                      'text-right': cell.column.id !== 'name',
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
      {/* {isFetching ? <Loader /> : null}
      {hasNextPage ? <LoadMoreTrigger intersectionRef={ref} /> : null} */}
    </div>
  )
}

export default FailedTestsTable
