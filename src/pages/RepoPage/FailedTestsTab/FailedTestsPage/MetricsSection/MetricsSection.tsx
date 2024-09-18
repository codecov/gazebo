import Badge from 'ui/Badge'
import Icon from 'ui/Icon'
import { MetricCard } from 'ui/MetricCard'
import { Tooltip } from 'ui/Tooltip'

const TooltipWithIcon = ({ children }: { children: React.ReactNode }) => {
  return (
    <Tooltip delayDuration={0} skipDelayDuration={100}>
      <Tooltip.Root>
        <Tooltip.Trigger>
          <div className="text-ds-gray-tertiary">
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

const TotalTestsRunTimeCard = () => {
  return (
    <MetricCard>
      <MetricCard.Header>
        <MetricCard.Title className="flex items-center gap-2">
          Total tests run time
          <TooltipWithIcon>
            The total time it takes to run all your tests.
          </TooltipWithIcon>
        </MetricCard.Title>
      </MetricCard.Header>

      <MetricCard.Content>
        125 hr
        <Badge variant="danger">+10%</Badge>
      </MetricCard.Content>
      <MetricCard.Description>
        Increased by 12.5hr in the last 30 days
      </MetricCard.Description>
    </MetricCard>
  )
}

const SlowestTestsCard = () => {
  return (
    <MetricCard>
      <MetricCard.Header>
        <MetricCard.Title className="flex items-center gap-2">
          Slowest tests
          <TooltipWithIcon>
            The number of tests that take the longer than 100ms time to
            complete.
          </TooltipWithIcon>
        </MetricCard.Title>
      </MetricCard.Header>

      <MetricCard.Content>6</MetricCard.Content>
      <MetricCard.Description>
        The total run time of the 6 tests is 2.5hr.
      </MetricCard.Description>
    </MetricCard>
  )
}

const TotalFlakyTestsCard = () => {
  return (
    <MetricCard>
      <MetricCard.Header>
        <MetricCard.Title className="flex items-center gap-2">
          Total flaky tests
          <TooltipWithIcon>
            The number of tests that transition from fail to pass or pass to
            fail in the last 30 days.
          </TooltipWithIcon>
        </MetricCard.Title>
      </MetricCard.Header>
      <MetricCard.Content>
        88
        <Badge variant="success">-15%</Badge>
      </MetricCard.Content>
      <MetricCard.Description>
        The total rerun time for flaky tests is 50hr.
      </MetricCard.Description>
    </MetricCard>
  )
}

const AverageFlakeRateCard = () => {
  return (
    <MetricCard>
      <MetricCard.Header>
        <MetricCard.Title className="flex items-center gap-2">
          Average flake rate
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
        On average, a flaky test ran 20 times before it passed.
      </MetricCard.Description>
    </MetricCard>
  )
}

const TotalFailuresCard = () => {
  return (
    <MetricCard>
      <MetricCard.Header>
        <MetricCard.Title className="flex items-center gap-2">
          Total failures
          <TooltipWithIcon>
            The number of failures indicates errors that caused the tests to
            fail.
          </TooltipWithIcon>
        </MetricCard.Title>
      </MetricCard.Header>
      <MetricCard.Content>6</MetricCard.Content>
      <MetricCard.Description>
        Recent failures across all branches.
      </MetricCard.Description>
    </MetricCard>
  )
}

const TotalSkippedTestsCard = () => {
  return (
    <MetricCard>
      <MetricCard.Header>
        <MetricCard.Title className="flex items-center gap-2">
          Total skipped tests
          <TooltipWithIcon>
            The number of tests that were skipped in the last 30 days.
          </TooltipWithIcon>
        </MetricCard.Title>
      </MetricCard.Header>

      <MetricCard.Content>55</MetricCard.Content>
      <MetricCard.Description>
        Total skipped tests across all branches.
      </MetricCard.Description>
    </MetricCard>
  )
}

function MetricsSection() {
  return (
    <div className="overflow-x-auto overflow-y-hidden md:flex">
      <div className="mb-6 flex flex-col gap-3 border-r-2 md:mb-0">
        <p className="pl-4 text-xs font-semibold text-ds-gray-quaternary">
          Improve CI Run Efficiency
        </p>
        <div className="flex">
          <TotalTestsRunTimeCard />
          <SlowestTestsCard />
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <p className="pl-4 text-xs font-semibold text-ds-gray-quaternary">
          Improve CI Run Efficiency
        </p>
        <div className="flex">
          <TotalFlakyTestsCard />
          <AverageFlakeRateCard />
          <TotalFailuresCard />
          <TotalSkippedTestsCard />
        </div>
      </div>
    </div>
  )
}

export default MetricsSection
