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

import { CommitStatuses, useCommits } from 'services/commits/useCommits'
import { useRepoOverview } from 'services/repo'
import Spinner from 'ui/Spinner'

import { createCommitsTableData } from './createCommitsTableData'

const Loader = () => (
  <div className="mb-4 flex justify-center pt-4">
    <Spinner />
  </div>
)

interface LoadMoreTriggerProps {
  intersectionRef: React.Ref<HTMLSpanElement>
}

function LoadMoreTrigger({ intersectionRef }: LoadMoreTriggerProps) {
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
  name: React.ReactElement
  patch: React.ReactElement
  bundleAnalysis: React.ReactElement
}

const columnHelper = createColumnHelper<CommitsTableHelper>()

const baseColumns = [
  columnHelper.accessor('name', {
    id: 'name',
    header: 'Name',
    cell: ({ renderValue }) => renderValue(),
  }),
  columnHelper.accessor('patch', {
    id: 'patch',
    header: 'Patch Coverage',
    cell: ({ renderValue }) => renderValue(),
  }),
]

interface URLParams {
  provider: string
  owner: string
  repo: string
}

interface CommitsTableProps {
  branch: string
  search: string
  coverageStatus: Array<CommitStatuses>
}

const CommitsTable: React.FC<CommitsTableProps> = ({
  branch,
  search,
  coverageStatus,
}) => {
  const { provider, owner, repo } = useParams<URLParams>()
  const { ref, inView } = useInView()
  const { data: overview } = useRepoOverview({ provider, owner, repo })

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
      branchName: decodeURIComponent(branch),
      coverageStatus: coverageStatus,
      search: search,
    },
  })

  useEffect(() => {
    if (inView && commitHasNextPage) {
      commitFetchNextPage()
    }
  }, [commitFetchNextPage, commitHasNextPage, inView])

  const tableData = useMemo(
    () =>
      createCommitsTableData({
        pages: commitsData?.pages,
      }),
    [commitsData?.pages]
  )

  const columns = useMemo(() => {
    if (
      overview?.bundleAnalysisEnabled &&
      !baseColumns.some((column) => column.id === 'bundleAnalysis')
    ) {
      return [
        ...baseColumns,
        columnHelper.accessor('bundleAnalysis', {
          header: 'Bundle',
          id: 'bundleAnalysis',
          cell: ({ renderValue }) => renderValue(),
        }),
      ]
    }

    return baseColumns
  }, [overview?.bundleAnalysisEnabled])

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
          <colgroup>
            <col className="w-full @sm/table:w-5/12" />
            <col className="@sm/table:w-1/12" />
            {overview?.bundleAnalysisEnabled ? (
              <col className="@sm/table:w-1/12" />
            ) : null}
          </colgroup>
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    scope="col"
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
                          cell.column.id === 'name',
                        'text-right': cell.column.id !== 'name',
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
