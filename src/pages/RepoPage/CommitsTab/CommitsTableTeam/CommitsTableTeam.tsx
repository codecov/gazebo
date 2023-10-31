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

import {
  type CommitStatsEnum,
  useCommitsTeam,
} from 'services/commits/useCommitsTeam'
import Spinner from 'ui/Spinner'

import { createCommitsTableTeamData } from './createCommitsTableTeamData'

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
interface CommitsTable {
  name: JSX.Element
  ciStatus: JSX.Element
  patch: JSX.Element
}

const columnHelper = createColumnHelper<CommitsTable>()

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
  columnHelper.accessor('patch', {
    id: 'patch',
    header: 'Patch',
    cell: ({ renderValue }) => renderValue(),
  }),
]

interface URLParams {
  provider: string
  owner: string
  repo: string
}

interface CommitsTableTeamProps {
  branch: string
  search: string
  states: Array<CommitStatsEnum>
}

const CommitsTableTeam: React.FC<CommitsTableTeamProps> = ({
  branch,
  search,
  states,
}) => {
  const { provider, owner, repo } = useParams<URLParams>()
  const { ref, inView } = useInView()

  const {
    data: commitsData,
    isLoading: commitsIsLoading,
    hasNextPage: commitHasNextPage,
    isFetchingNextPage: commitIsFetchingNextPage,
    fetchNextPage: commitFetchNextPage,
  } = useCommitsTeam({
    provider,
    owner,
    repo,
    filters: {
      branchName: branch,
      states: states,
      search: search,
    },
  })

  useEffect(() => {
    if (inView && commitHasNextPage) {
      commitFetchNextPage()
    }
  }, [commitFetchNextPage, commitHasNextPage, inView])

  const tableData = useMemo(
    () => createCommitsTableTeamData({ pages: commitsData?.pages }),
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
                      'text-right':
                        header.id === 'ciStatus' || header.id === 'patch',
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
      {commitIsFetchingNextPage ? <Loader /> : null}
      {commitHasNextPage ? <LoadMoreTrigger intersectionRef={ref} /> : null}
    </>
  )
}

export default CommitsTableTeam
