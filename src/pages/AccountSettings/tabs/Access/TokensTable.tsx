import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import cs from 'classnames'
import { ReactNode, useCallback, useMemo } from 'react'
import { useParams } from 'react-router-dom'

import { useRevokeUserToken, UserToken } from 'services/access'
import Button from 'ui/Button'

import 'ui/Table/Table.css'

interface URLParams {
  provider: string
}

interface TokenColumn {
  name: string
  token: ReactNode
  revokeBtn: ReactNode
}

const columnHelper = createColumnHelper<TokenColumn>()
const columns = [
  columnHelper.accessor('name', { header: 'Name' }),
  columnHelper.accessor('token', {
    header: 'Token',
    cell: (data) => data.renderValue(),
  }),
  columnHelper.accessor('revokeBtn', {
    header: '',
    cell: (data) => data.renderValue(),
  }),
]

interface TokensTableProps {
  tokens: UserToken[]
}

function TokensTable({ tokens }: TokensTableProps) {
  const { provider } = useParams<URLParams>()
  const { mutate } = useRevokeUserToken({ provider })

  const handleRevoke = useCallback(
    (id: string) => {
      if (window.confirm('Are you sure you want to revoke this token?')) {
        mutate({ tokenid: id })
      }
    },
    [mutate]
  )

  const data = useMemo(
    () =>
      tokens.map((t) => ({
        name: t.name,
        token: (
          <p className="w-fit bg-ds-gray-secondary font-mono font-bold text-ds-gray-octonary">{`xxxx ${t.lastFour}`}</p>
        ),
        revokeBtn: (
          <Button
            disabled={false}
            to={undefined}
            hook="revoke-session"
            onClick={() => handleRevoke(t.id)}
            variant="danger"
          >
            Revoke
          </Button>
        ),
      })),
    [handleRevoke, tokens]
  )

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  if (!tokens.length) {
    return (
      <div>
        <hr className="my-4 border-ds-gray-secondary" />
        <span className="text-sm">No tokens created yet</span>
      </div>
    )
  }

  return (
    <div className="tableui mt-4 max-w-screen-md">
      <table>
        <colgroup>
          <col className="@sm/table:w-4/6" />
          <col className="@sm/table:w-1/6" />
          <col className="@sm/table:w-1/6" />
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
                  className={cs({
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

export default TokensTable
