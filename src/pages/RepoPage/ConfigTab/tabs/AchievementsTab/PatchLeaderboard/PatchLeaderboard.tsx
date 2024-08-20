import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { useMemo } from 'react'
import { useParams } from 'react-router-dom'

import Avatar from 'ui/Avatar'
import { Card } from 'ui/Card'
import Spinner from 'ui/Spinner'

import { useAchievements } from '../hooks/useAchievements'

interface URLParams {
  provider: string
  owner: string
  repo: string
}

type Contributor = {
  username: string
  avatarUrl?: string
}

type PatchLeaderboardTableColumn = {
  rank: number
  contributor: Contributor
  value: string
}

const columnHelper = createColumnHelper<PatchLeaderboardTableColumn>()
const columns = [
  columnHelper.accessor('rank', {
    header: 'Rank',
    cell: (cell) => <div className="flex sm:ml-5">{cell.renderValue()}</div>,
  }),
  columnHelper.accessor('contributor', {
    header: 'Contributor',
    cell: ({ row }) => {
      const { username, avatarUrl } = row.original.contributor
      return (
        <div className="flex items-center space-x-2">
          <Avatar user={{ username, avatarUrl }} />
          <span>{username}</span>
        </div>
      )
    },
  }),
  columnHelper.accessor('value', {
    header: 'Patch Coverage %',
    cell: (cell) => cell.renderValue(),
  }),
]

const Loader = () => (
  <div className="mb-4 flex justify-center pt-4">
    <Spinner />
  </div>
)

export const PatchLeaderboard = () => {
  const { provider, owner, repo } = useParams<URLParams>()

  const { data, isLoading } = useAchievements({
    provider,
    owner,
    repo,
  })

  const tableData = useMemo(() => {
    if (!data || data.__typename !== 'Repository') {
      return []
    }
    const leaderboard = data.leaderboards.find(
      (achievement) => achievement?.name === 'PATCH_COVERAGE_AVERAGE'
    )
    if (!leaderboard) {
      return []
    }

    return leaderboard.ranking.map((entry, index) => ({
      id: index,
      rank: index + 1,
      contributor: entry?.author,
      value: `${entry?.value?.toFixed(2)}%`,
    }))
  }, [data])

  const table = useReactTable({
    columns,
    data: tableData,
    getCoreRowModel: getCoreRowModel<PatchLeaderboardTableColumn>(),
  })

  return (
    <Card>
      <Card.Header>
        <Card.Title size="base">Top 5 Patch Perfectionists</Card.Title>
      </Card.Header>
      <Card.Content className="flex flex-col gap-4">
        <p>
          Awarded for maintaining an average patch coverage above [95%] across
          all PRs in the repo over the last 30 days.
        </p>
        <table className="tableui border">
          <colgroup>
            <col />
            <col />
            <col className="sm:w-1/6" />
          </colgroup>
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="bg-ds-gray-primary">
                {headerGroup.headers.map((header) => (
                  <th key={header.id} scope="col">
                    <div className="flex py-2">
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
            {isLoading ? (
              <tr>
                <td colSpan={columns.length}>
                  <Loader />
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      {...(cell.column.id === 'value'
                        ? {
                            'data-type': 'numeric',
                          }
                        : {})}
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
      </Card.Content>
    </Card>
  )
}
