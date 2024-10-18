import {
  CellContext,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table'
import cs from 'classnames'
import isEmpty from 'lodash/isEmpty'
import qs from 'qs'
import { useEffect, useMemo, useState } from 'react'
import { useInView } from 'react-intersection-observer'
import { useLocation, useParams } from 'react-router-dom'

import { MEASUREMENT_INTERVAL_TYPE } from 'pages/RepoPage/shared/constants'
import { isFreePlan, isTeamPlan } from 'shared/utils/billing'
import { formatTimeToNow } from 'shared/utils/dates'
import Icon from 'ui/Icon'
import Spinner from 'ui/Spinner'
import { Tooltip } from 'ui/Tooltip'

import {
  OrderingDirection,
  OrderingParameter,
  useInfiniteTestResults,
} from '../hooks/useInfiniteTestResults'
import { TestResultsFilterParameterType } from '../hooks/useInfiniteTestResults/useInfiniteTestResults'
import { TooltipWithIcon } from '../MetricsSection/MetricsSection'

const getDecodedBranch = (branch?: string) =>
  !!branch ? decodeURIComponent(branch) : undefined

const Loader = () => (
  <div className="mt-16 flex flex-1 items-center justify-center">
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

export function getSortingOption(
  sorting: Array<{ id: string; desc: boolean }>
) {
  const state = sorting[0]

  if (state) {
    const direction = state.desc
      ? OrderingDirection.DESC
      : OrderingDirection.ASC

    let parameter: keyof typeof OrderingParameter =
      OrderingParameter.COMMITS_WHERE_FAIL

    if (state.id === 'avgDuration') {
      parameter = OrderingParameter.AVG_DURATION
    }

    if (state.id === 'failureRate') {
      parameter = OrderingParameter.FAILURE_RATE
    }

    if (state.id === 'flakeRate') {
      parameter = OrderingParameter.FLAKE_RATE
    }

    if (state.id === 'commitsFailed') {
      parameter = OrderingParameter.COMMITS_WHERE_FAIL
    }

    if (state.id === 'updatedAt') {
      parameter = OrderingParameter.UPDATED_AT
    }

    return { direction, parameter }
  }

  return undefined
}

const isNumericValue = (value: string) =>
  value === 'avgDuration' ||
  value === 'failureRate' ||
  value === 'commitsFailed' ||
  value === 'flakeRate'

interface FailedTestsColumns {
  name: string
  avgDuration: number | null
  failureRate: number | null
  flakeRate?: React.ReactNode
  commitsFailed: number | null
  updatedAt: string
}

const columnHelper = createColumnHelper<FailedTestsColumns>()

const getColumns = (hideFlakeRate: boolean) => {
  const baseColumns = [
    columnHelper.accessor('name', {
      header: () => 'Test name',
      cell: (info) => info.renderValue(),
    }),
    columnHelper.accessor('avgDuration', {
      header: () => 'Avg duration',
      cell: (info) => `${(info.renderValue() ?? 0).toFixed(3)}s`,
    }),
    columnHelper.accessor('failureRate', {
      header: () => 'Failure rate',
      cell: (info) => {
        const value = (info.renderValue() ?? 0) * 100
        const isInt = Number.isInteger(info.renderValue())
        return isInt ? `${value}%` : `${value.toFixed(2)}%`
      },
    }),
    columnHelper.accessor('commitsFailed', {
      header: () => 'Commits failed',
      cell: (info) => (info.renderValue() ? info.renderValue() : 0),
    }),
    columnHelper.accessor('updatedAt', {
      header: () => 'Last run',
      cell: (info) => formatTimeToNow(info.renderValue()),
    }),
  ]

  if (!hideFlakeRate) {
    baseColumns.splice(3, 0, {
      accessorKey: 'flakeRate',
      header: () => (
        <div className="flex items-center gap-1">
          Flake rate
          <TooltipWithIcon>
            Shows how often a flake occurs by tracking how many times a test
            goes from fail to pass or pass to fail on a given branch and commit
            within the last [7] days.
          </TooltipWithIcon>
        </div>
      ),
      cell: (info: CellContext<FailedTestsColumns, number | null>) =>
        info.renderValue(),
    })
  }

  return baseColumns
}

interface URLParams {
  provider: string
  owner: string
  repo: string
  branch?: string
}

const FailedTestsTable = () => {
  const { ref, inView } = useInView()
  const [sorting, setSorting] = useState<SortingState>([
    {
      id: 'commitsFailed',
      desc: true,
    },
  ])
  const { provider, owner, repo, branch } = useParams<URLParams>()
  const location = useLocation()
  const queryParams = qs.parse(location.search, {
    ignoreQueryPrefix: true,
    depth: 1,
  })

  let flags = undefined
  if (Array.isArray(queryParams?.flags) && queryParams?.flags?.length > 0) {
    flags = queryParams?.flags
  }

  let testSuites = undefined
  if (
    Array.isArray(queryParams?.testSuites) &&
    queryParams?.testSuites?.length > 0
  ) {
    testSuites = queryParams?.testSuites
  }

  const {
    data: testData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteTestResults({
    provider,
    owner,
    repo,
    ordering: getSortingOption(sorting),
    filters: {
      branch: branch ? getDecodedBranch(branch) : undefined,
      flags: flags as string[],
      // eslint-disable-next-line camelcase
      test_suites: testSuites as string[],
      parameter: queryParams?.parameter as TestResultsFilterParameterType,
      interval: queryParams?.historicalTrend as MEASUREMENT_INTERVAL_TYPE,
      term: queryParams?.term as string,
    },
    opts: {
      suspense: false,
    },
  })

  // Only show flake rate column when on default branch for pro / enterprise plans or public repos
  const hideFlakeRate =
    ((isTeamPlan(testData?.plan) || isFreePlan(testData?.plan)) &&
      testData?.private) ||
    (!!branch && testData?.defaultBranch !== branch)

  const tableData = useMemo(() => {
    if (!testData?.testResults) return []

    return (
      testData.testResults.map((result) => {
        const value = (result.flakeRate ?? 0) * 100
        const isFlakeInt = Number.isInteger(value)

        const FlakeRateContent = (
          <Tooltip delayDuration={0} skipDelayDuration={100}>
            <Tooltip.Root>
              <Tooltip.Trigger className="underline decoration-dotted decoration-1 underline-offset-4">
                {isFlakeInt ? `${value}%` : `${value.toFixed(2)}%`}
              </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Content
                  className="bg-ds-gray-primary p-2 text-xs text-ds-gray-octonary"
                  side="right"
                >
                  {result.totalPassCount} Passed, {result.totalFailCount} Failed
                  ({result.totalFlakyFailCount} Flaky), {result.totalSkipCount}{' '}
                  Skipped
                  <Tooltip.Arrow className="size-4 fill-ds-gray-primary" />
                </Tooltip.Content>
              </Tooltip.Portal>
            </Tooltip.Root>
          </Tooltip>
        )

        return {
          name: result.name,
          avgDuration: result.avgDuration,
          failureRate: result.failureRate,
          flakeRate: FlakeRateContent,
          commitsFailed: result.commitsFailed,
          updatedAt: result.updatedAt,
        }
      }) ?? []
    )
  }, [testData?.testResults])

  const columns = useMemo(() => getColumns(!!hideFlakeRate), [hideFlakeRate])

  const table = useReactTable({
    columns,
    data: tableData,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage()
    }
  }, [fetchNextPage, inView, hasNextPage])

  if (isEmpty(testData?.testResults) && !isLoading && !!branch) {
    return (
      <div className="flex justify-center">
        <br /> No test results found
      </div>
    )
  }

  return (
    <>
      <div className="tableui">
        <table>
          <colgroup>
            <col className="w-full @sm/table:w-5/12" />
            <col className="@sm/table:w-1/12" />
            <col className="@sm/table:w-1/12" />
            <col className="@sm/table:w-1/12" />
            <col className="@sm/table:w-1/12" />
          </colgroup>
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    data-sortable={header.column.getCanSort()}
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div
                      className={cs('flex gap-1', {
                        'flex-row-reverse': !['name', 'updatedAt'].includes(
                          header.id
                        ),
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
          <tbody data-testid="failed-tests-table-body">
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
                      {...(isNumericValue(cell.column.id)
                        ? {
                            'data-type': 'numeric',
                          }
                        : {})}
                      className={cs({
                        'text-right': !['name', 'updatedAt'].includes(
                          cell.column.id
                        ),
                        'max-w-1 break-words': cell.column.id === 'name',
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

export default FailedTestsTable
