import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import cs from 'classnames'
import isEmpty from 'lodash/isEmpty'
import PropTypes from 'prop-types'
import { useContext, useMemo } from 'react'
import { useParams } from 'react-router-dom'

import { Repository, useReposTeam } from 'services/repos'
import { ActiveContext } from 'shared/context'
import { formatTimeToNow } from 'shared/utils/dates'
import Button from 'ui/Button'

import InactiveRepo from '../InactiveRepo'
import { repoDisplayOptions } from '../ListRepo'
import NoReposBlock from '../NoReposBlock'
import 'ui/Table/Table.css'
import RepoTitleLink from '../RepoTitleLink'

const columnHelper = createColumnHelper<Repository>()

interface ReposTableTeamProps {
  sortItem: {
    text: string
    ordering: string
    direction: string
  }
  searchValue: string
}

const getColumns = ({
  inactive,
  isCurrentUserPartOfOrg,
}: {
  inactive: boolean
  isCurrentUserPartOfOrg: boolean
}) => {
  if (inactive) {
    return [
      columnHelper.accessor('name', {
        header: 'Name',
        cell: (info) => {
          const repo = info.row.original
          return (
            <RepoTitleLink
              repo={repo}
              showRepoOwner={!!repo?.author?.username}
              pageName={!!repo?.active ? 'repo' : 'new'}
              disabledLink={!isCurrentUserPartOfOrg && !repo?.active}
            />
          )
        },
      }),
      columnHelper.accessor('lines', {
        header: '',
        cell: (info) => {
          const repo = info.row.original
          return (
            <InactiveRepo
              owner={repo?.author?.username ?? ''}
              repoName={repo?.name}
              isCurrentUserPartOfOrg={isCurrentUserPartOfOrg}
              isActive={!!repo?.active}
            />
          )
        },
      }),
    ]
  }
  return [
    columnHelper.accessor('name', {
      header: 'Name',
      cell: (info) => {
        const repo = info.row.original
        return (
          <RepoTitleLink
            repo={repo}
            showRepoOwner={!!repo?.author?.username}
            pageName={!!repo?.active ? 'repo' : 'new'}
            disabledLink={!isCurrentUserPartOfOrg && !repo?.active}
          />
        )
      },
    }),
    columnHelper.accessor('latestCommitAt', {
      header: 'Last Updated',
      cell: (info) => {
        return (
          <span className="text-ds-gray-quinary">
            {info?.renderValue() ? formatTimeToNow(info?.renderValue()) : ''}
          </span>
        )
      },
    }),
    columnHelper.accessor('lines', {
      header: ' Tracked Lines',
      cell: (info) => {
        const repo = info.row.original
        return typeof repo?.lines === 'number' && !!repo?.active ? (
          <span>{repo.lines}</span>
        ) : (
          <InactiveRepo
            owner={repo?.author?.username ?? ''}
            repoName={repo?.name}
            isCurrentUserPartOfOrg={isCurrentUserPartOfOrg}
            isActive={!!repo?.active}
          />
        )
      },
    }),
  ]
}

const ReposTableTeam = ({ sortItem, searchValue }: ReposTableTeamProps) => {
  const { owner } = useParams<{ owner: string }>()

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
  } = useReposTeam({
    activated,
    sortItem,
    term: searchValue,
    owner,
  })

  const isCurrentUserPartOfOrg = !!reposData?.pages?.[0]?.isCurrentUserPartOfOrg

  const tableData = useMemo(
    () => reposData?.pages?.map((page) => page?.repos).flat(),
    [reposData?.pages]
  )
  const table = useReactTable({
    columns: getColumns({
      inactive: repoDisplay === repoDisplayOptions.INACTIVE.text,
      isCurrentUserPartOfOrg: isCurrentUserPartOfOrg,
    }),
    getCoreRowModel: getCoreRowModel(),
    data: tableData ?? [],
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
                  {...(header.column.id === 'lines'
                    ? {
                        'data-type': 'numeric',
                      }
                    : {})}
                  scope="col"
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
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <td
                  key={cell.id}
                  className={cs('', {
                    'flex justify-end': cell.column.id === 'lines',
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

ReposTableTeam.propTypes = {
  sortItem: PropTypes.shape({
    text: PropTypes.string.isRequired,
    ordering: PropTypes.string.isRequired,
    direction: PropTypes.string.isRequired,
  }).isRequired,
  searchValue: PropTypes.string.isRequired,
}

export default ReposTableTeam
