import { format } from 'date-fns'
import { useParams } from 'react-router-dom'

import { useBranches } from 'services/branches'
import { useRepoOverview } from 'services/repo'
import CoverageAreaChart from 'ui/CoverageAreaChart'

import { useBranchSelector, useRepoCoverageTimeseries } from '../../hooks'

function makeDesc({ first, last, repo, data }) {
  if (!data || !first || !last) return ''
  const firstDateFormatted = format(new Date(first.date), 'MMM dd, yyy')
  const lastDateFormatted = format(new Date(last.date), 'MMM dd, yyy')
  const coverageDiff = Math.abs(first.coverage, last.coverage)
  const change = first.coverage < last.coverage ? '+' : '-'

  return `${repo} coverage chart from ${firstDateFormatted} to ${lastDateFormatted}, coverage change is ${change}${coverageDiff}%`
}

const Placeholder = () => (
  <div className="h-[22rem] animate-pulse rounded bg-ds-gray-tertiary" />
)

const useCoverageChart = () => {
  const { provider, owner, repo } = useParams()
  const { data: overview } = useRepoOverview({
    provider,
    repo,
    owner,
  })
  const { data: branchesData } = useBranches({ repo, provider, owner })
  const { selection } = useBranchSelector({
    branches: branchesData?.branches,
    defaultBranch: overview?.defaultBranch,
  })

  return useRepoCoverageTimeseries(
    {
      branch: selection?.name,
    },
    {
      enabled: !!selection?.name,
      suspense: false,
      keepPreviousData: true,
    }
  )
}

function CoverageChart() {
  const { repo } = useParams()
  const { data, isPreviousData, isSuccess, isError } = useCoverageChart()

  const desc = makeDesc({
    data: data?.coverage,
    first: data?.coverage?.[0],
    last: data?.coverage?.[data?.coverage.length - 1],
    repo,
  })

  if (isError) {
    return <p>The coverage chart failed to load.</p>
  }

  if (!isPreviousData && !isSuccess) {
    return <Placeholder />
  }

  return (
    <CoverageAreaChart
      axisLabelFunc={data?.coverageAxisLabel}
      data={data?.coverage}
      title={`${repo} coverage chart`}
      desc={desc}
      renderAreaChart={isPreviousData || isSuccess}
      // These aprox heights let us adjust the ratio and size of the chart.
      // I get these numbers by using the root container space and reducing
      // w/h to something that renders close to the DOM text sizes.
      aproxHeight={91}
      aproxWidth={282.1}
    />
  )
}

export default CoverageChart
