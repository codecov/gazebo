import type { SortingState } from '@tanstack/react-table'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import cs from 'classnames'
import isEmpty from 'lodash/isEmpty'
import PropTypes from 'prop-types'
import { useContext, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'

import {
  OrderingDirection,
  Repository,
  TeamOrdering,
  useReposTeam,
} from 'services/repos'
import { ActiveContext } from 'shared/context'
import { formatTimeToNow } from 'shared/utils/dates'
import Button from 'ui/Button'
import Icon from 'ui/Icon'

import InactiveRepo from '../InactiveRepo'
import { repoDisplayOptions } from '../ListRepo'
import NoReposBlock from '../NoReposBlock'
import RepoTitleLink from '../RepoTitleLink'

export function getSortingOption(
  sorting: Array<{ id: string; desc: boolean }>
) {
  const state = sorting[0]

  if (state) {
    const direction = state.desc
      ? OrderingDirection.DESC
      : OrderingDirection.ASC

    let ordering
    if (state.id === 'name') {
      ordering = TeamOrdering.NAME
    }

    if (state.id === 'latestCommitAt') {
      ordering = TeamOrdering.COMMIT_DATE
    }

    return { direction, ordering }
  }

  return undefined
}

const columnHelper = createColumnHelper<Repository>()

interface ReposTableTeamProps {
  searchValue: string
}

const getColumns = ({
  inactive,
  isCurrentUserPartOfOrg,
}: {
  inactive: boolean
  isCurrentUserPartOfOrg: boolean
}) => {
  const nameColumn = columnHelper.accessor('name', {
    header: 'Name',
    id: 'name',
    cell: (info) => {
      const repo = info.row.original
      let pageName = 'new'
      if (!!repo?.coverageEnabled) {
        pageName = 'repo'
      } else if (!!repo?.bundleAnalysisEnabled) {
        pageName = 'bundles'
      }

      return (
        <RepoTitleLink
          repo={repo}
          showRepoOwner={!!repo?.author?.username}
          pageName={pageName}
          disabledLink={!isCurrentUserPartOfOrg && !repo?.active}
        />
      )
    },
  })

  if (inactive) {
    return [
      nameColumn,
      columnHelper.accessor('coverageAnalytics.lines', {
        header: '',
        id: 'lines',
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
    nameColumn,
    columnHelper.accessor('latestCommitAt', {
      header: 'Last updated',
      id: 'latestCommitAt',
      cell: (info) => {
        return (
          <span className="text-ds-gray-quinary">
            {info?.renderValue() ? formatTimeToNow(info?.renderValue()) : ''}
          </span>
        )
      },
    }),
    columnHelper.accessor('coverageAnalytics.lines', {
      header: 'Tracked lines',
      id: 'lines',
      cell: (info) => {
        const repo = info.row.original
        return typeof repo?.coverageAnalytics?.lines === 'number' &&
          !!repo?.active ? (
          <span>{repo.coverageAnalytics?.lines}</span>
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

const ReposTableTeam = ({ searchValue }: ReposTableTeamProps) => {
  const [sorting, setSorting] = useState<SortingState>([
    {
      id: 'latestCommitAt',
      desc: true,
    },
  ])
  const { owner } = useParams<{ owner: string }>()

  const repoDisplay = useContext(ActiveContext)

  const activated =
    repoDisplayOptions[
      repoDisplay
        .replace(/\s/g, '_')
        .toUpperCase() as keyof typeof repoDisplayOptions
    ]?.status

  const {
    data: reposData,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
  } = useReposTeam({
    activated,
    sortItem: getSortingOption(sorting),
    term: searchValue,
    owner,
  })

  const isCurrentUserPartOfOrg = !!reposData?.pages?.[0]?.isCurrentUserPartOfOrg

  const tableData = useMemo(() => {
    const data = reposData?.pages?.map((page) => page?.repos).flat()
    return data ?? []
  }, [reposData?.pages])
  const table = useReactTable({
    columns: getColumns({
      inactive: repoDisplay === repoDisplayOptions.NOT_CONFIGURED.text,
      isCurrentUserPartOfOrg: isCurrentUserPartOfOrg,
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
                  {...(header.column.id === 'lines'
                    ? {
                        'data-type': 'numeric',
                      }
                    : {})}
                  scope="col"
                  data-sortable={
                    header.column.getCanSort() && header.column.id !== 'lines'
                  }
                  {...(header.column.id !== 'lines'
                    ? { onClick: header.column.getToggleSortingHandler() }
                    : {})}
                >
                  <div
                    className={cs('flex gap-1', {
                      // reverse the order of the icon and text so the text is aligned well when not active.
                      'flex-row-reverse': header.id === 'lines',
                    })}
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
                    'text-right': cell.column.id === 'lines',
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
  searchValue: PropTypes.string.isRequired,
}

export default ReposTableTeam
