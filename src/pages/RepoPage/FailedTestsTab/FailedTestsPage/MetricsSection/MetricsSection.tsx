import qs from 'qs'
import { useLocation, useParams } from 'react-router-dom'

import { MeasurementInterval } from 'pages/RepoPage/shared/constants'
import { useLocationParams } from 'services/navigation'
import { isFreePlan, isTeamPlan } from 'shared/utils/billing'
import { cn } from 'shared/utils/cn'
import { formatTimeFromSeconds } from 'shared/utils/dates'
import Badge from 'ui/Badge'
import Icon from 'ui/Icon'
import { MetricCard } from 'ui/MetricCard'
import { Tooltip } from 'ui/Tooltip'

import { useFlakeAggregates } from '../hooks/useFlakeAggregates'
import { TestResultsFilterParameterType } from '../hooks/useInfiniteTestResults/useInfiniteTestResults'
import { useTestResultsAggregates } from '../hooks/useTestResultsAggregates'
import { defaultQueryParams } from '../SelectorSection'

const PercentBadge = ({ value }: { value: number }) => {
  let variant: 'success' | 'danger' = 'success'
  let prefix = ''

  if (value > 0) {
    variant = 'danger'
    prefix = '+'
  }

  return (
    <Badge variant={variant}>
      {prefix}
      {value.toFixed(2)}%
    </Badge>
  )
}

export const TooltipWithIcon = ({
  children,
}: {
  children: React.ReactNode
}) => {
  return (
    <Tooltip delayDuration={0} skipDelayDuration={100}>
      <Tooltip.Root>
        <Tooltip.Trigger>
          <div className="text-ds-gray-tertiary dark:text-ds-gray-quinary">
            <Icon name="informationCircle" size="sm" />
          </div>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            side="right"
            className="w-64 rounded-md bg-ds-gray-primary p-3 text-xs text-ds-gray-octonary"
          >
            {children}
            <Tooltip.Arrow className="size-4 fill-gray-100" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip>
  )
}

const TotalTestsRunTimeCard = ({
  totalDuration,
  totalDurationPercentChange,
  intervalCopy,
}: {
  totalDuration?: number
  totalDurationPercentChange?: number | null
  intervalCopy: string
}) => {
  return (
    <MetricCard>
      <MetricCard.Header>
        <MetricCard.Title className="flex items-center gap-2">
          Total test run time
          <TooltipWithIcon>
            The total time it takes to run all your tests.
          </TooltipWithIcon>
        </MetricCard.Title>
      </MetricCard.Header>

      <MetricCard.Content>
        {formatTimeFromSeconds(totalDuration)}
        {totalDurationPercentChange ? (
          <PercentBadge value={totalDurationPercentChange} />
        ) : null}
      </MetricCard.Content>
      <MetricCard.Description>
        The cumulative time spent running tests over the last {intervalCopy}
      </MetricCard.Description>
    </MetricCard>
  )
}

const SlowestTestsCard = ({
  slowestTests,
  slowestTestsPercentChange,
  slowestTestsDuration,
  isSelected,
  updateParams,
}: {
  slowestTests?: number
  slowestTestsPercentChange?: number | null
  slowestTestsDuration?: number | null
  isSelected: boolean
  updateParams: (newParams: {
    parameter: TestResultsFilterParameterType
  }) => void
}) => {
  return (
    <MetricCard>
      <MetricCard.Header>
        <MetricCard.Title className="flex items-center gap-2">
          Slowest tests
          <TooltipWithIcon>
            Lists the tests that take more than the 95th percentile run time to
            complete. Showing a max of 100 tests.
          </TooltipWithIcon>
        </MetricCard.Title>
      </MetricCard.Header>

      <MetricCard.Content>
        <button
          className={cn('text-ds-blue-default hover:underline', {
            'font-semibold': isSelected,
          })}
          onClick={() => {
            updateParams({ parameter: 'SLOWEST_TESTS' })
          }}
        >
          {slowestTests}
        </button>
        {slowestTestsPercentChange ? (
          <PercentBadge value={slowestTestsPercentChange} />
        ) : null}
      </MetricCard.Content>
      <MetricCard.Description>
        The slowest {slowestTests} tests take{' '}
        {formatTimeFromSeconds(slowestTestsDuration)} to run.
      </MetricCard.Description>
    </MetricCard>
  )
}

const TotalFlakyTestsCard = ({
  flakeCount,
  flakeCountPercentChange,
  isSelected,
  updateParams,
}: {
  flakeCount?: number
  flakeCountPercentChange?: number | null
  isSelected: boolean
  updateParams: (newParams: {
    parameter: TestResultsFilterParameterType
  }) => void
}) => {
  return (
    <MetricCard>
      <MetricCard.Header>
        <MetricCard.Title className="flex items-center gap-2">
          Flaky tests
          <TooltipWithIcon>
            The number of tests that transition from fail to pass or pass to
            fail.
          </TooltipWithIcon>
        </MetricCard.Title>
      </MetricCard.Header>
      <MetricCard.Content>
        <button
          className={cn('text-ds-blue-default hover:underline', {
            'font-semibold': isSelected,
          })}
          onClick={() => {
            updateParams({ parameter: 'FLAKY_TESTS' })
          }}
        >
          {flakeCount}
        </button>
        {flakeCountPercentChange ? (
          <PercentBadge value={flakeCountPercentChange} />
        ) : null}
      </MetricCard.Content>
      <MetricCard.Description>
        The number of flaky tests in your test suite.
      </MetricCard.Description>
    </MetricCard>
  )
}

const AverageFlakeRateCard = ({
  flakeRate,
  flakeRatePercentChange,
}: {
  flakeRate?: number
  flakeRatePercentChange?: number | null
}) => {
  return (
    <MetricCard>
      <MetricCard.Header>
        <MetricCard.Title className="flex items-center gap-2">
          Avg. flake rate
          <TooltipWithIcon>
            The percentage of tests that flake, based on how many times a test
            transitions from fail to pass or pass to fail on a given branch and
            commit.
          </TooltipWithIcon>
        </MetricCard.Title>
      </MetricCard.Header>
      <MetricCard.Content>
        {flakeRate}%
        {flakeRatePercentChange ? (
          <PercentBadge value={flakeRatePercentChange} />
        ) : null}
      </MetricCard.Content>
      <MetricCard.Description>
        The average flake rate across all branches.
      </MetricCard.Description>
    </MetricCard>
  )
}

const TotalFailuresCard = ({
  totalFails,
  totalFailsPercentChange,
  isSelected,
  updateParams,
}: {
  totalFails?: number
  totalFailsPercentChange?: number | null
  isSelected: boolean
  updateParams: (newParams: {
    parameter: TestResultsFilterParameterType
  }) => void
}) => {
  return (
    <MetricCard>
      <MetricCard.Header>
        <MetricCard.Title className="flex items-center gap-2">
          Failures
          <TooltipWithIcon>
            The number of failures indicate the number of errors that caused the
            tests to fail.
          </TooltipWithIcon>
        </MetricCard.Title>
      </MetricCard.Header>
      <MetricCard.Content>
        <button
          className={cn('text-ds-blue-default hover:underline', {
            'font-semibold': isSelected,
          })}
          onClick={() => {
            updateParams({ parameter: 'FAILED_TESTS' })
          }}
        >
          {totalFails}
        </button>
        {totalFailsPercentChange ? (
          <PercentBadge value={totalFailsPercentChange} />
        ) : null}
      </MetricCard.Content>
      <MetricCard.Description>
        The number of test failures across all branches.
      </MetricCard.Description>
    </MetricCard>
  )
}

const TotalSkippedTestsCard = ({
  totalSkips,
  totalSkipsPercentChange,
  isSelected,
  updateParams,
}: {
  totalSkips?: number
  totalSkipsPercentChange?: number | null
  isSelected: boolean
  updateParams: (newParams: {
    parameter: TestResultsFilterParameterType
  }) => void
}) => {
  return (
    <MetricCard>
      <MetricCard.Header>
        <MetricCard.Title className="flex items-center gap-2">
          Skipped tests
          <TooltipWithIcon>
            The number of tests that were skipped.
          </TooltipWithIcon>
        </MetricCard.Title>
      </MetricCard.Header>

      <MetricCard.Content>
        <button
          className={cn('text-ds-blue-default hover:underline', {
            'font-semibold': isSelected,
          })}
          onClick={() => {
            updateParams({ parameter: 'SKIPPED_TESTS' })
          }}
        >
          {totalSkips}
        </button>
        {totalSkipsPercentChange ? (
          <PercentBadge value={totalSkipsPercentChange} />
        ) : null}
      </MetricCard.Content>
      <MetricCard.Description>
        The number of skipped tests in your test suite.
      </MetricCard.Description>
    </MetricCard>
  )
}

interface URLParams {
  provider: string
  owner: string
  repo: string
  branch?: string
}

const getDecodedBranch = (branch?: string) =>
  !!branch ? decodeURIComponent(branch) : undefined

export const historicalTrendToCopy = (interval?: MeasurementInterval) => {
  switch (interval) {
    case 'INTERVAL_1_DAY':
      return '1 day'
    case 'INTERVAL_7_DAY':
      return '7 days'
    case 'INTERVAL_30_DAY':
      return '30 days'
    default:
      return '30 days'
  }
}

function MetricsSection() {
  const { branch } = useParams<URLParams>()

  const { updateParams } = useLocationParams(defaultQueryParams)

  const location = useLocation()
  const queryParams = qs.parse(location.search, {
    ignoreQueryPrefix: true,
    depth: 1,
  })

  const { data: testResults } = useTestResultsAggregates({
    interval: queryParams?.historicalTrend as MeasurementInterval,
  })
  const disabledFlakeAggregates =
    (isTeamPlan(testResults?.plan) || isFreePlan(testResults?.plan)) &&
    testResults?.private
  const { data: flakeAggregates } = useFlakeAggregates({
    interval: queryParams?.historicalTrend as MeasurementInterval,
    opts: {
      enabled: !disabledFlakeAggregates,
    },
  })

  const decodedBranch = getDecodedBranch(branch)
  const selectedBranch = decodedBranch ?? testResults?.defaultBranch ?? ''

  if (selectedBranch !== testResults?.defaultBranch) {
    return null
  }

  const aggregates = testResults?.testResultsAggregates

  return (
    <>
      <hr />
      <div className="overflow-x-auto overflow-y-hidden md:flex">
        <div className="mb-6 flex flex-col gap-3 border-r-2 md:mb-0">
          <p className="pl-4 text-xs font-semibold text-ds-gray-quaternary">
            Improve CI Run Efficiency
          </p>
          <div className="grid grid-cols-2">
            <TotalTestsRunTimeCard
              totalDuration={aggregates?.totalDuration}
              totalDurationPercentChange={
                aggregates?.totalDurationPercentChange
              }
              intervalCopy={historicalTrendToCopy(
                queryParams?.historicalTrend as MeasurementInterval
              )}
            />
            <SlowestTestsCard
              slowestTests={aggregates?.totalSlowTests}
              slowestTestsPercentChange={
                aggregates?.totalSlowTestsPercentChange
              }
              slowestTestsDuration={aggregates?.slowestTestsDuration}
              updateParams={updateParams}
              isSelected={queryParams?.parameter === 'SLOWEST_TESTS'}
            />
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <p className="pl-4 text-xs font-semibold text-ds-gray-quaternary">
            Improve Test Performance
          </p>
          <div
            className={cn(
              'grid',
              !!flakeAggregates ? 'grid-cols-4' : 'grid-cols-2'
            )}
          >
            {!!flakeAggregates ? (
              <>
                <TotalFlakyTestsCard
                  flakeCount={flakeAggregates?.flakeCount}
                  flakeCountPercentChange={
                    flakeAggregates?.flakeCountPercentChange
                  }
                  updateParams={updateParams}
                  isSelected={queryParams?.parameter === 'FLAKY_TESTS'}
                />
                <AverageFlakeRateCard
                  flakeRate={flakeAggregates?.flakeRate}
                  flakeRatePercentChange={
                    flakeAggregates?.flakeRatePercentChange
                  }
                />
              </>
            ) : null}
            <TotalFailuresCard
              totalFails={aggregates?.totalFails}
              totalFailsPercentChange={aggregates?.totalFailsPercentChange}
              updateParams={updateParams}
              isSelected={queryParams?.parameter === 'FAILED_TESTS'}
            />
            <TotalSkippedTestsCard
              totalSkips={aggregates?.totalSkips}
              totalSkipsPercentChange={aggregates?.totalSkipsPercentChange}
              updateParams={updateParams}
              isSelected={queryParams?.parameter === 'SKIPPED_TESTS'}
            />
          </div>
        </div>
      </div>
    </>
  )
}

export default MetricsSection
