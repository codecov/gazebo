import { useParams } from 'react-router-dom'

import { useRepoOverview } from 'services/repo'
import Badge from 'ui/Badge'
import Icon from 'ui/Icon'
import { MetricCard } from 'ui/MetricCard'
import { Tooltip } from 'ui/Tooltip'

import { useTestResultsAggregates } from '../hooks/useTestResultsAggregates'

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
}: {
  totalDuration?: number
  totalDurationPercentChange?: number | null
}) => {
  return (
    <MetricCard>
      <MetricCard.Header>
        <MetricCard.Title className="flex items-center gap-2">
          Test run time
          <TooltipWithIcon>
            The total time it takes to run all your tests.
          </TooltipWithIcon>
        </MetricCard.Title>
      </MetricCard.Header>

      <MetricCard.Content>
        {totalDuration}
        {totalDurationPercentChange ? (
          <PercentBadge value={totalDurationPercentChange} />
        ) : null}
      </MetricCard.Content>
      <MetricCard.Description>
        Increased by [12.5hr] in the last [30 days]
      </MetricCard.Description>
    </MetricCard>
  )
}

const SlowestTestsCard = ({
  slowestTests,
  slowestTestsDuration,
}: {
  slowestTests?: number
  slowestTestsDuration?: number | null
}) => {
  return (
    <MetricCard>
      <MetricCard.Header>
        <MetricCard.Title className="flex items-center gap-2">
          Slowest tests
          <TooltipWithIcon>
            The number of tests that take the longer than [100ms] to complete.
          </TooltipWithIcon>
        </MetricCard.Title>
      </MetricCard.Header>

      <MetricCard.Content>{slowestTests}</MetricCard.Content>
      <MetricCard.Description>
        The slowest {slowestTests} tests take {slowestTestsDuration} to run.
      </MetricCard.Description>
    </MetricCard>
  )
}

const TotalFlakyTestsCard = () => {
  return (
    <MetricCard>
      <MetricCard.Header>
        <MetricCard.Title className="flex items-center gap-2">
          Flaky tests
          <TooltipWithIcon>
            The number of tests that transition from fail to pass or pass to
            fail in the last [30 days].
          </TooltipWithIcon>
        </MetricCard.Title>
      </MetricCard.Header>
      <MetricCard.Content>
        88
        <Badge variant="success">-15%</Badge>
      </MetricCard.Content>
      <MetricCard.Description>
        *The total rerun time for flaky tests is [50hr].
      </MetricCard.Description>
    </MetricCard>
  )
}

const AverageFlakeRateCard = () => {
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
        8%
        <Badge variant="success">-35%</Badge>
      </MetricCard.Content>
      <MetricCard.Description>
        On average, a flaky test ran [20] times before it passed.
      </MetricCard.Description>
    </MetricCard>
  )
}

const TotalFailuresCard = ({
  totalFails,
  totalFailsPercentChange,
}: {
  totalFails?: number
  totalFailsPercentChange?: number | null
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
        {totalFails}
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
}: {
  totalSkips?: number
  totalSkipsPercentChange?: number | null
}) => {
  return (
    <MetricCard>
      <MetricCard.Header>
        <MetricCard.Title className="flex items-center gap-2">
          Skipped tests
          <TooltipWithIcon>
            The number of tests that were skipped in the last 30 days.
          </TooltipWithIcon>
        </MetricCard.Title>
      </MetricCard.Header>

      <MetricCard.Content>
        {totalSkips}
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

function MetricsSection() {
  const { provider, owner, repo, branch } = useParams<URLParams>()

  const { data: overview } = useRepoOverview({
    provider,
    owner,
    repo,
  })

  const { data: aggregates } = useTestResultsAggregates()

  const decodedBranch = getDecodedBranch(branch)
  const selectedBranch = decodedBranch ?? overview?.defaultBranch ?? ''

  if (selectedBranch !== overview?.defaultBranch) {
    return null
  }

  return (
    <>
      <hr />
      <div className="overflow-x-auto overflow-y-hidden md:flex">
        <div className="mb-6 flex flex-col gap-3 border-r-2 md:mb-0">
          <p className="pl-4 text-xs font-semibold text-ds-gray-quaternary">
            Improve CI Run Efficiency
          </p>
          <div className="flex">
            <TotalTestsRunTimeCard
              totalDuration={aggregates?.totalDuration}
              totalDurationPercentChange={
                aggregates?.totalDurationPercentChange
              }
            />
            <SlowestTestsCard
              slowestTests={6}
              slowestTestsDuration={aggregates?.slowestTestsDuration}
            />
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <p className="pl-4 text-xs font-semibold text-ds-gray-quaternary">
            Improve Test Performance
          </p>
          <div className="flex">
            <TotalFlakyTestsCard />
            <AverageFlakeRateCard />
            <TotalFailuresCard
              totalFails={aggregates?.totalFails}
              totalFailsPercentChange={aggregates?.totalFailsPercentChange}
            />
            <TotalSkippedTestsCard
              totalSkips={aggregates?.totalSkips}
              totalSkipsPercentChange={aggregates?.totalSkipsPercentChange}
            />
          </div>
        </div>
      </div>
    </>
  )
}

export default MetricsSection
