import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import cs from 'classnames'
import isEmpty from 'lodash/isEmpty'
import { useMemo } from 'react'
import { useParams } from 'react-router-dom'

import { FlagsComparison, usePull } from 'services/pull/usePull'
import FlagsNotConfigured from 'shared/FlagsNotConfigured'
import Spinner from 'ui/Spinner'
import TotalsNumber from 'ui/TotalsNumber'

const Loader = () => (
  <div className="mb-4 flex justify-center pt-4">
    <Spinner />
  </div>
)

const columnHelper = createColumnHelper<FlagsComparison>()

const columns = [
  columnHelper.accessor('name', {
    id: 'name',
    header: () => 'Name',
    cell: ({ renderValue }) => (
      <h2 className="w-full break-words">{renderValue()}</h2>
    ),
  }),
  columnHelper.accessor('headTotals.percentCovered', {
    id: 'coverage',
    header: () => 'HEAD %',
    cell: ({ renderValue }) => (
      <TotalsNumber
        value={renderValue()}
        plain
        light
        showChange={false}
        large={false}
      />
    ),
  }),
  columnHelper.accessor('patchTotals.percentCovered', {
    id: 'patch',
    header: () => 'Patch %',
    cell: ({ renderValue }) => (
      <TotalsNumber
        value={renderValue()}
        plain
        light
        showChange={false}
        large={false}
      />
    ),
  }),
  columnHelper.accessor('baseTotals.percentCovered', {
    id: 'change',
    header: () => 'Change %',
    cell: ({ row }) => {
      const headCoverage = row?.original?.headTotals?.percentCovered
      const baseCoverage = row?.original?.baseTotals?.percentCovered

      let change = null
      if (headCoverage != null && baseCoverage != null) {
        change = headCoverage - baseCoverage
      }

      return (
        <TotalsNumber
          value={change}
          showChange
          data-testid="change-value"
          light
          plain={false}
          large={false}
        />
      )
    },
  }),
]

interface URLParams {
  provider: string
  owner: string
  repo: string
  pullId: string
}

export default function FlagsTable() {
  const { provider, owner, repo, pullId } = useParams<URLParams>()

  const { data, isLoading } = usePull({
    provider,
    owner,
    repo,
    pullId,
  })

  const tableData = useMemo(() => {
    if (
      data?.pull?.compareWithBase?.__typename === 'Comparison' &&
      data?.pull?.compareWithBase?.flagComparisons
    ) {
      return data?.pull?.compareWithBase?.flagComparisons
    }

    return []
  }, [data])

  const table = useReactTable({
    columns,
    data: tableData,
    getCoreRowModel: getCoreRowModel(),
  })

  if (isEmpty(tableData) && !isLoading) {
    return <FlagsNotConfigured />
  }

  return (
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
                      'flex-row-reverse': header.id === 'name',
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
                    className={cs('text-sm', {
                      'w-full max-w-0 font-medium @md/table:w-auto @md/table:max-w-none':
                        cell.column.id === 'name',
                      'flex justify-end':
                        cell.column.id === 'change' ||
                        cell.column.id === 'coverage',
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
    </div>
  )
}
