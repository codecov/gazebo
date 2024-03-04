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
import { usePulls } from 'services/pulls'
import 'ui/Table/Table.css'
import { useRepoOverview } from 'services/repo'
import { useFlags } from 'shared/featureFlags'
import Spinner from 'ui/Spinner'

import { createPullsTableData } from './createPullsTableData'

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
  coverage: React.ReactElement
  change: React.ReactElement
  bundleAnalysis: React.ReactElement
}>()

const baseColumns = [
  columnHelper.accessor('title', {
    id: 'title',
    header: () => 'Name',
    cell: ({ renderValue }) => renderValue(),
  }),
  columnHelper.accessor('coverage', {
    id: 'coverage',
    header: () => (
      <>
        Coverage on <span className="ml-1 font-light">HEAD</span>
      </>
    ),
    cell: ({ renderValue }) => renderValue(),
  }),
  columnHelper.accessor('patch', {
    id: 'patch',
    header: () => 'Patch',
    cell: ({ renderValue }) => renderValue(),
  }),
  columnHelper.accessor('change', {
    id: 'change',
    header: () => (
      <>
        Change from <span className="ml-1 font-light">BASE</span>
      </>
    ),
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
  const { data: overview } = useRepoOverview({ provider, owner, repo })
  const { bundleAnalysisPrAndCommitPages } = useFlags({
    bundleAnalysisPrAndCommitPages: false,
  })

  const {
    data: pullsData,
    isLoading: pullsIsLoading,
    fetchNextPage: fetchNextPullsPage,
    hasNextPage: pullsHasNextPage,
    isFetchingNextPage: pullsIsFetchingNextPage,
  } = usePulls({
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
      createPullsTableData({
        pulls: pullsData?.pulls,
      }),
    [pullsData?.pulls]
  )

  const columns = useMemo(() => {
    if (
      overview?.bundleAnalysisEnabled &&
      !baseColumns.some((column) => column.id === 'bundleAnalysis') &&
      bundleAnalysisPrAndCommitPages
    ) {
      return [
        ...baseColumns,
        columnHelper.accessor('bundleAnalysis', {
          header: 'Bundle Analysis',
          id: 'bundleAnalysis',
          cell: ({ renderValue }) => renderValue(),
        }),
      ]
    }

    return baseColumns
  }, [bundleAnalysisPrAndCommitPages, overview?.bundleAnalysisEnabled])

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
                      className={cs('flex gap-1 items-center justify-end', {
                        'flex-row-reverse': header.id === 'title',
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
                        'flex justify-end': cell.column.id === 'change',
                        'text-right': cell.column.id === 'patch',
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
