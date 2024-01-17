import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table'
import cs from 'classnames'
import isEmpty from 'lodash/isEmpty'
import { useContext, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'

import { useRepos } from 'services/repos'
import { TierNames, useTier } from 'services/tier'
import { useOwner, useUser } from 'services/user'
import { ActiveContext } from 'shared/context'
import Button from 'ui/Button'
import Icon from 'ui/Icon'

import { getReposColumnsHelper } from './getReposColumnsHelper'

import 'ui/Table/Table.css'
import { repoDisplayOptions } from '../ListRepo'
import NoReposBlock from '../NoReposBlock'

interface URLParams {
  provider: string
}

interface ReposTableProps {
  searchValue: string
  owner: string
  sortItem?: {
    ordering?: string
    direction: string
  }
  filterValues?: string[]
}

const ReposTable = ({
  searchValue,
  owner,
  sortItem,
  filterValues = [],
}: ReposTableProps) => {
  const [sorting, setSorting] = useState<SortingState>([
    {
      id: 'latestCommitAt',
      desc: true,
    },
  ])

  const { provider } = useParams<URLParams>()

  const { data: userData } = useUser()
  const { data: ownerData } = useOwner({
    username: owner || userData?.user?.username,
  })
  const isCurrentUserPartOfOrg = ownerData?.isCurrentUserPartOfOrg

  const { data: tierName } = useTier({ provider, owner })
  const shouldDisplayPublicReposOnly = tierName === TierNames.TEAM ? true : null

  const repoDisplay = useContext(ActiveContext)
  const activated =
    repoDisplayOptions[
      repoDisplay.toUpperCase() as keyof typeof repoDisplayOptions
    ]?.status

  const {
    data: reposData,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
  } = useRepos({
    activated,
    sortItem,
    term: searchValue,
    repoNames: filterValues,
    owner,
    isPublic: shouldDisplayPublicReposOnly,
  })

  console.log(
    useRepos({
      activated,
      sortItem,
      term: searchValue,
      repoNames: filterValues,
      owner,
      isPublic: shouldDisplayPublicReposOnly,
    })
  )

  const tableData = useMemo(() => {
    const data = reposData?.pages?.map((page) => page?.repos).flat()
    return data ?? []
  }, [reposData?.pages])

  const table = useReactTable({
    columns: getReposColumnsHelper({
      inactive: repoDisplay === repoDisplayOptions.INACTIVE.text,
      isCurrentUserPartOfOrg: isCurrentUserPartOfOrg,
      owner,
    }),
    getCoreRowModel: getCoreRowModel(),
    data: tableData,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
  })

  if (!isFetching && isEmpty(tableData)) {
    return <NoReposBlock searchValue={searchValue} />
  }

  return (
    <div className="tableui">
      <table>
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  colSpan={header.colSpan}
                  scope="col"
                  data-sortable={header.column.getCanSort()}
                  {...(header.column.id !== 'inactiveRepo'
                    ? { onClick: header.column.getToggleSortingHandler() }
                    : {})}
                  {...(header.column.id === 'lines'
                    ? { 'data-type': 'numeric' }
                    : {})}
                >
                  <div
                    className={`flex gap-1 ${
                      header.id === 'coverage' ? 'flex-row-reverse' : ''
                    } ${header.id === 'lines' ? 'justify-end' : ''}`}
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                    <span
                      className="text-ds-blue-darker group-hover/columnheader:opacity-100"
                      data-sort-direction={header.column.getIsSorted()}
                    >
                      <Icon name="arrowUp" size="sm" />
                    </span>
                  </div>
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
                    'flex justify-end':
                      cell.column.id === 'coverage' ||
                      cell.column.id === 'inactiveRepo',
                  })}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {hasNextPage && (
        <div className="flex w-full justify-center">
          <Button
            hook="load-more"
            isLoading={isFetchingNextPage}
            onClick={fetchNextPage}
            to={undefined}
            disabled={false}
          >
            Load More
          </Button>
        </div>
      )}
    </div>
  )
}

export default ReposTable
