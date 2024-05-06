import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { useCallback, useMemo } from 'react'
import { useParams } from 'react-router-dom'

import { Session, useDeleteSession } from 'services/access'
import { cn } from 'shared/utils/cn'
import { formatTimeToNow } from 'shared/utils/dates'
import Button from 'ui/Button'

import 'ui/Table/Table.css'

interface SessionColumn {
  ip: React.ReactNode
  lastSeen: string
  userAgent: string
  revokeBtn: React.ReactNode
}

const columnHelper = createColumnHelper<SessionColumn>()
const columns = [
  columnHelper.accessor('ip', {
    header: 'IP',
    cell: (data) => data.renderValue(),
  }),
  columnHelper.accessor('lastSeen', { header: 'Last seen' }),
  columnHelper.accessor('userAgent', { header: 'User agent' }),
  columnHelper.accessor('revokeBtn', {
    header: '',
    cell: (data) => data.renderValue(),
  }),
]

interface URLParams {
  provider: string
}

interface SessionsTableProps {
  sessions?: (Session | null)[]
}

function SessionsTable({ sessions }: SessionsTableProps) {
  const { provider } = useParams<URLParams>()
  const { mutate } = useDeleteSession({ provider })
  const handleRevoke = useCallback(
    (sessionid: number) => {
      if (window.confirm('Are you sure you want to revoke this session?')) {
        mutate({ sessionid })
      }
    },
    [mutate]
  )

  const data = useMemo(() => {
    if (!sessions) {
      return []
    }

    return sessions.flatMap((s) =>
      s === null
        ? []
        : ({
            ip: (
              <p className="w-fit bg-ds-gray-secondary font-mono font-bold text-ds-gray-octonary">
                {s.ip}
              </p>
            ),
            lastSeen: s.lastseen ? formatTimeToNow(s.lastseen) : '-',
            userAgent: s.useragent,
            revokeBtn: (
              <Button
                disabled={false}
                to={undefined}
                hook="revoke-session"
                onClick={() => handleRevoke(s.sessionid)}
                variant="danger"
              >
                Revoke
              </Button>
            ),
          } as SessionColumn)
    )
  }, [sessions, handleRevoke])

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className="tableui">
      <table>
        <colgroup>
          <col className="@sm/table:w-2/12" />
          <col className="@sm/table:w-3/12" />
          <col className="@sm/table:w-5/12" />
          <col className="@sm/table:w-2/12" />
        </colgroup>
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id}>
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
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <td
                  key={cell.id}
                  className={cn({
                    'flex justify-center': cell.column.id === 'revokeBtn',
                  })}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default SessionsTable
