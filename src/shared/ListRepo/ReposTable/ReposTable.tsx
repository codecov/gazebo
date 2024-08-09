import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table'
import cs from 'classnames'
import isEmpty from 'lodash/isEmpty'
import { useContext, useEffect, useMemo, useState } from 'react'
import { useInView } from 'react-intersection-observer'
import { useParams } from 'react-router-dom'

import { OrderingDirection, useRepos } from 'services/repos'
import { TierNames, useTier } from 'services/tier'
import { useOwner } from 'services/user'
import AppLink from 'shared/AppLink'
import { ActiveContext } from 'shared/context'
import Icon from 'ui/Icon'
import Spinner from 'ui/Spinner'

import { getReposColumnsHelper } from './getReposColumnsHelper'

import { repoDisplayOptions } from '../ListRepo'
import NoReposBlock from '../NoReposBlock'

interface URLParams {
  provider: string
}

interface ReposTableProps {
  searchValue: string
  owner: string
  filterValues?: string[]
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
}: ReposTableProps) => {
  const [sorting, setSorting] = useState<SortingState>([
    {
      id: 'latestCommitAt',
      desc: true,
    },
  ])

  const { ref, inView } = useInView()

  const { provider } = useParams<URLParams>()

  const { data: ownerData } = useOwner({
    username: owner,
  })
  const isCurrentUserPartOfOrg = ownerData?.isCurrentUserPartOfOrg

  const { data: tierName } = useTier({
    provider,
    owner,
  })
  const shouldDisplayPublicReposOnly = tierName === TierNames.TEAM ? true : null

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
    isLoading,
    isFetchingNextPage,
  } = useRepos({
    provider,
    owner,
    activated,
    sortItem: getOrderingDirection(sorting),
    term: searchValue,
    repoNames: filterValues,
    isPublic: shouldDisplayPublicReposOnly,
  })

  const tableData = useMemo(() => {
    const data = reposData?.pages?.map((page) => page?.repos).flat()
    return data ?? []
  }, [reposData?.pages])

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage()
    }
  }, [fetchNextPage, inView, hasNextPage])

  const table = useReactTable({
    columns: getReposColumnsHelper({
      inactive: repoDisplay === repoDisplayOptions.NOT_CONFIGURED.text,
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

  if (!isLoading && isEmpty(tableData)) {
    return <NoReposBlock searchValue={searchValue} />
  }

  // is on repo page, is not enterprise, is my page, is "new sign up"
  const shouldShowDemoRow = true

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
            {/* custom demo row */}
            {shouldShowDemoRow ? (
              <tr>
                <td>
                  <div className="flex items-center">
                    <AppLink
                      pageName="codecovDemoRepo"
                      className="flex items-center text-ds-gray-quinary hover:underline"
                    >
                      <Icon size="sm" variant="solid" name="globeAlt" />
                      <span className="ml-2.5 mr-1 text-sm font-semibold text-black">
                        Codecov demo
                      </span>
                    </AppLink>
                    <span
                      className={cs(
                        'text-xs ml-3.5 px-1.5 py-1 border-solid border border-gray-300 rounded border-box inline-block'
                      )}
                    >
                      System generated
                    </span>
                  </div>
                </td>
              </tr>
            ) : null}

            {/* data rows */}
            {isLoading ? (
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
