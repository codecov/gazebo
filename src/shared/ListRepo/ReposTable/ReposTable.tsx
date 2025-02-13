import { useInfiniteQuery as useInfiniteQueryV5 } from '@tanstack/react-queryV5'
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table'
import cs from 'classnames'
import isEmpty from 'lodash/isEmpty'
import { useEffect, useMemo, useState } from 'react'
import { useInView } from 'react-intersection-observer'
import { useParams } from 'react-router-dom'

import config from 'config'

import {
  OrderingDirection,
  ReposQueryOpts,
} from 'services/repos/ReposQueryOpts'
import { useIsTeamPlan } from 'services/useIsTeamPlan'
import { useOwner, useUser } from 'services/user'
import { DEMO_REPO, formatDemoRepos, isNotNull } from 'shared/utils/demo'
import { getFilteredRecentlyVisitedRepo } from 'shared/utils/getFilteredRecentlyVisitedRepo'
import { transformStringToLocalStorageKey } from 'shared/utils/transformStringToLocalStorageKey'
import Icon from 'ui/Icon'
import Spinner from 'ui/Spinner'

import { getReposColumnsHelper } from './getReposColumnsHelper'

import NoReposBlock from '../NoReposBlock'

interface URLParams {
  provider: string
}

interface ReposTableProps {
  searchValue: string
  owner: string
  filterValues?: string[]
  mayIncludeDemo?: boolean
}

function getOrderingDirection(sorting: Array<{ id: string; desc: boolean }>) {
  const state = sorting[0]

  if (state) {
    const direction = state?.desc
      ? OrderingDirection.DESC
      : OrderingDirection.ASC

    let ordering = undefined
    if (state.id === 'name') {
      ordering = 'NAME'
    }

    if (state.id === 'coverage') {
      ordering = 'COVERAGE'
    }

    if (state.id === 'latestCommitAt') {
      ordering = 'COMMIT_DATE'
    }

    return { direction, ordering }
  }

  return undefined
}

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

const ReposTable = ({
  searchValue,
  owner,
  filterValues = [],
  mayIncludeDemo = false,
}: ReposTableProps) => {
  const [sorting, setSorting] = useState<SortingState>([
    {
      id: 'latestCommitAt',
      desc: true,
    },
  ])

  const { ref, inView } = useInView()

  const { provider } = useParams<URLParams>()

  const { data: currentUser } = useUser({
    options: {
      suspense: false,
    },
  })

  const { data: ownerData } = useOwner({
    username: owner,
  })
  const isCurrentUserPartOfOrg = ownerData?.isCurrentUserPartOfOrg

  const { data: isTeamPlan } = useIsTeamPlan({
    provider,
    owner,
  })

  // fetch owner repos
  const {
    data: reposData,
    fetchNextPage,
    hasNextPage,
    isLoading: isReposLoading,
    isFetchingNextPage,
  } = useInfiniteQueryV5(
    ReposQueryOpts({
      provider,
      owner,
      sortItem: getOrderingDirection(sorting),
      term: searchValue,
      repoNames: filterValues,
      isPublic: isTeamPlan === true ? true : null,
    })
  )

  // fetch demo repo(s)
  const { data: demoReposData } = useInfiniteQueryV5(
    ReposQueryOpts({
      provider: DEMO_REPO.provider,
      owner: DEMO_REPO.owner,
      repoNames: [DEMO_REPO.repo],
    })
  )

  const recentlyVisitedRepoName = localStorage.getItem(
    `${transformStringToLocalStorageKey(owner)}_recently_visited`
  )

  const { data: recentlyVisitedRepoData } = useInfiniteQueryV5(
    ReposQueryOpts({
      provider,
      owner,
      repoNames: recentlyVisitedRepoName ? [recentlyVisitedRepoName] : [],
    })
  )

  const isMyOwnerPage = currentUser?.user?.username === owner

  const tableData = useMemo(() => {
    const repos =
      reposData?.pages.flatMap((page) => page?.repos).filter(isNotNull) ?? []

    const configuredRepos = repos.reduce(
      (acc, repo) => (repo.coverageEnabled ? acc + 1 : acc),
      0
    )

    const includeDemo =
      mayIncludeDemo &&
      !config.IS_SELF_HOSTED &&
      isMyOwnerPage &&
      configuredRepos < 2

    const demoRepos = includeDemo
      ? formatDemoRepos(demoReposData, searchValue)
      : []

    const filteredRecentlyVisitedRepo = getFilteredRecentlyVisitedRepo(
      recentlyVisitedRepoData,
      searchValue,
      owner
    )
    // only filter out the recently visited repo from the repos list if we are including it
    const filteredRepos = filteredRecentlyVisitedRepo
      ? repos.filter((repo) => recentlyVisitedRepoName !== repo.name)
      : repos

    return [
      ...demoRepos,
      ...(filteredRecentlyVisitedRepo ? [filteredRecentlyVisitedRepo] : []),
      ...filteredRepos,
    ]
  }, [
    reposData?.pages,
    demoReposData,
    searchValue,
    isMyOwnerPage,
    mayIncludeDemo,
    recentlyVisitedRepoData,
    recentlyVisitedRepoName,
    owner,
  ])

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage()
    }
  }, [fetchNextPage, inView, hasNextPage])

  const table = useReactTable({
    columns: getReposColumnsHelper({
      isCurrentUserPartOfOrg: !!isCurrentUserPartOfOrg,
      owner,
    }),
    getCoreRowModel: getCoreRowModel(),
    // @ts-expect-error taking in both ReposQueryData and ReposTeamQueryData
    data: tableData,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    enableSortingRemoval: false,
    manualSorting: true,
  })

  if (!isReposLoading && isEmpty(tableData)) {
    return <NoReposBlock searchValue={searchValue} />
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
                    colSpan={header.colSpan}
                    scope="col"
                    data-sortable={
                      header.column.getCanSort() && header.column.id !== 'lines'
                    }
                    {...(header.column.id !== 'inactiveRepo' &&
                    header.column.id !== 'lines'
                      ? { onClick: header.column.getToggleSortingHandler() }
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
            {isReposLoading ? (
              <tr>
                <td colSpan={table.getAllColumns().length}>
                  <Loader />
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className={cs({
                        'text-right':
                          cell.column.id === 'coverage' ||
                          cell.column.id === 'inactiveRepo',
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
      {isFetchingNextPage ? <Loader /> : null}
      {hasNextPage ? <LoadMoreTrigger intersectionRef={ref} /> : null}
    </>
  )
}

export default ReposTable
