import { format } from 'date-fns'
import { useParams } from 'react-router-dom'

import { useBranches } from 'services/branches'
import { useRepoOverview } from 'services/repo'
import CoverageAreaChart from 'ui/CoverageAreaChart'

import { useBranchSelector, useRepoCoverageTimeseries } from '../hooks'

function makeDesc({ first, last, repo, data }) {
  if (!data) return ''
  const firstDateFormatted = format(new Date(first.date), 'MMM dd, yyy')
  const lastDateFormatted = format(new Date(last.date), 'MMM dd, yyy')
  const coverageDiff = Math.abs(first.coverage, last.coverage)
  const change = first.coverage < last.coverage ? '+' : '-'

  return `${repo} coverage chart from ${firstDateFormatted} to ${lastDateFormatted}, coverage change is ${change}${coverageDiff}%`
}

function Chart() {
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
  const { data, isPreviousData, isSuccess } = useRepoCoverageTimeseries(
    {
      branch: selection?.name,
    },
    {
      enabled: !!selection?.name,
      suspense: false,
      keepPreviousData: true,
    }
  )

  const desc = makeDesc({
    data: data?.coverage,
    first: data?.coverage[0],
    last: data?.coverage[data?.coverage.length - 1],
    repo,
  })

  return (
    <CoverageAreaChart
      axisLabelFunc={data?.coverageAxisLabel}
      data={data?.coverage}
      title={`${repo} coverage chart`}
      desc={desc}
      renderAreaChart={isPreviousData || isSuccess}
    />
  )
}

export default Chart
