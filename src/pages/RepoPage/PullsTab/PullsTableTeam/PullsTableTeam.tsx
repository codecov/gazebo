import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import cs from 'classnames'
import isEmpty from 'lodash/isEmpty'
import { useEffect, useMemo } from 'react'
import { useInView } from 'react-intersection-observer'
import { useParams } from 'react-router-dom'

import { useLocationParams } from 'services/navigation'
import { usePullsTeam } from 'services/pulls/usePullsTeam'
import 'ui/Table/Table.css'
import Spinner from 'ui/Spinner'

import { createPullsTableTeamData } from './createPullsTableTeamData'

import { orderingEnum } from '../enums'

const Loader = () => (
  <div className="mb-4 flex justify-center pt-4">
    <Spinner />
  </div>
)

function LoadMoreTrigger({ intersectionRef }: { intersectionRef: any }) {
  return (
    <span
      ref={intersectionRef}
      className="invisible relative top-[-65px] block leading-[0]"
    >
      Loading
    </span>
  )
}

const columnHelper = createColumnHelper<{
  title: React.ReactElement
  patch: React.ReactElement
}>()

const columns = [
  columnHelper.accessor('title', {
    id: 'title',
    header: () => 'Name',
    cell: ({ renderValue }) => renderValue(),
  }),
  columnHelper.accessor('patch', {
    id: 'patch',
    header: () => 'Patch %',
    cell: ({ renderValue }) => renderValue(),
  }),
]

const defaultParams = {
  order: orderingEnum.Newest.order,
  prStates: [],
}

interface URLParams {
  provider: string
  owner: string
  repo: string
}

export default function PullsTableTeam() {
  const { provider, owner, repo } = useParams<URLParams>()
  const { ref, inView } = useInView()
  // we really need to TS'ify and generic'ify useLocationParams
  const { params } = useLocationParams(defaultParams)

  const {
    data: pullsData,
    isLoading: pullsIsLoading,
    fetchNextPage: fetchNextPullsPage,
    hasNextPage: pullsHasNextPage,
    isFetchingNextPage: pullsIsFetchingNextPage,
  } = usePullsTeam({
    provider,
    owner,
    repo,
    filters: {
      // useLocationParams needs to be updated to have full types
      // @ts-expect-errors
      state: params?.prStates,
    },
    // useLocationParams needs to be updated to have full types
    // @ts-expect-error
    orderingDirection: params?.order,
  })

  useEffect(() => {
    if (inView && pullsHasNextPage) {
      fetchNextPullsPage()
    }
  }, [fetchNextPullsPage, inView, pullsHasNextPage])

  const tableData = useMemo(
    () =>
      createPullsTableTeamData({
        pages: pullsData?.pages,
      }),
    [pullsData?.pages]
  )

  const table = useReactTable({
    columns,
    data: tableData,
    getCoreRowModel: getCoreRowModel(),
  })

  if (isEmpty(tableData) && !pullsIsLoading) {
    return <p className="m-4">No pulls found</p>
  }

  return (
    <>
      <div className="tableui">
        <table>
          <colgroup>
            <col className="w-full @sm/table:w-10/12" />
            <col className="@sm/table:w-2/12" />
          </colgroup>
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id} scope="col">
                    <div
                      className={cs('flex gap-1 items-center', {
                        'flex-row-reverse justify-end': header.id === 'title',
                        'justify-end': header.id === 'patch',
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
            {pullsIsLoading ? (
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
                      className={cs('text-sm', {
                        'w-full max-w-0 font-medium @md/table:w-auto @md/table:max-w-none':
                          cell.column.id === 'title',
                        'justify-end': cell.column.id === 'patch',
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
      {pullsIsFetchingNextPage ? <Loader /> : null}
      {pullsHasNextPage ? <LoadMoreTrigger intersectionRef={ref} /> : null}
    </>
  )
}
