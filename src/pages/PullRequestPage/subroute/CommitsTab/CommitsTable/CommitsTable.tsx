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

import { useCommits } from 'services/commits/useCommits'
import Spinner from 'ui/Spinner'

import { createCommitsTableData } from './createCommitsTableData'

import 'ui/Table/Table.css'

const Loader = () => (
  <div className="mb-4 flex justify-center pt-4">
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
interface CommitsTableHelper {
  name: JSX.Element
  coverage: JSX.Element
  ciStatus: JSX.Element
  patch: JSX.Element
  change: JSX.Element
}

const columnHelper = createColumnHelper<CommitsTableHelper>()

const columns = [
  columnHelper.accessor('name', {
    id: 'name',
    header: 'Name',
    cell: ({ renderValue }) => renderValue(),
  }),
  columnHelper.accessor('ciStatus', {
    id: 'ciStatus',
    header: 'CI Status',
    cell: ({ renderValue }) => renderValue(),
  }),
  columnHelper.accessor('coverage', {
    id: 'coverage',
    header: 'Coverage',
    cell: ({ renderValue }) => renderValue(),
  }),
  columnHelper.accessor('patch', {
    id: 'patch',
    header: 'Patch',
    cell: ({ renderValue }) => renderValue(),
  }),
  columnHelper.accessor('change', {
    id: 'change',
    header: 'Change',
    cell: ({ renderValue }) => renderValue(),
  }),
]

interface URLParams {
  provider: string
  owner: string
  repo: string
  pullId: string
}

const CommitsTable = () => {
  const { provider, owner, repo, pullId } = useParams<URLParams>()
  const { ref, inView } = useInView()

  const {
    data: commitsData,
    isLoading: commitsIsLoading,
    hasNextPage: commitHasNextPage,
    isFetchingNextPage: commitIsFetchingNextPage,
    fetchNextPage: commitFetchNextPage,
  } = useCommits({
    provider,
    owner,
    repo,
    filters: {
      pullId: +pullId,
    },
  })

  useEffect(() => {
    if (inView && commitHasNextPage) {
      commitFetchNextPage()
    }
  }, [commitFetchNextPage, commitHasNextPage, inView])

  const tableData = useMemo(
    () => createCommitsTableData({ pages: commitsData?.pages }),
    [commitsData?.pages]
  )

  const table = useReactTable({
    columns,
    data: tableData,
    getCoreRowModel: getCoreRowModel(),
  })

  if (isEmpty(tableData) && !commitsIsLoading) {
    return <p className="m-4">No commits found</p>
  }

  return (
    <>
      <div className="tableui">
        <table>
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className={cs({
                      'text-right': header.id !== 'name',
                    })}
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {commitsIsLoading ? (
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
                        'text-right': cell.column.id === 'change',
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
      {commitIsFetchingNextPage ? <Loader /> : null}
      {commitHasNextPage ? <LoadMoreTrigger intersectionRef={ref} /> : null}
    </>
  )
}

export default CommitsTable
