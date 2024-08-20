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

type PullsLeaderboardTableColumn = {
  rank: number
  contributor: Contributor
  value: string
}

const columnHelper = createColumnHelper<PullsLeaderboardTableColumn>()
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
    header: 'PRs merged',
    cell: (cell) => cell.renderValue(),
  }),
]

const Loader = () => (
  <div className="mb-4 flex justify-center pt-4">
    <Spinner />
  </div>
)

const PullsLeaderboard = () => {
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
      (achievement) => achievement?.name === 'PR_COUNT'
    )
    if (!leaderboard) {
      return []
    }

    return leaderboard.ranking.map((entry, index) => ({
      id: index,
      rank: index + 1,
      contributor: entry?.author,
      value: entry?.value.toString(),
    }))
  }, [data])

  const table = useReactTable({
    columns,
    data: tableData,
    getCoreRowModel: getCoreRowModel<PullsLeaderboardTableColumn>(),
  })

  return (
    <Card>
      <Card.Header>
        <Card.Title size="base">Top 5 PR Powerhouse</Card.Title>
      </Card.Header>
      <Card.Content className="flex flex-col gap-4">
        <p>
          For cracking most PRs across all PRs in the repo over the last 30
          days.
        </p>
        <table className="tableui border">
          <colgroup>
            <col />
            <col />
            <col className="sm:w-1/12" />
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

export default PullsLeaderboard
