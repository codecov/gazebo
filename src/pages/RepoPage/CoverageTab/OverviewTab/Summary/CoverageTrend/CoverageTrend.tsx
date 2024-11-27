import { useParams } from 'react-router-dom'

import { useBranches } from 'services/branches'
import { useRepoOverview } from 'services/repo'
import Spinner from 'ui/Spinner'
import { SummaryField } from 'ui/Summary'
import TotalsNumber from 'ui/TotalsNumber'

import { useBranchSelector, useRepoCoverageTimeseries } from '../../hooks'
import TrendDropdown from '../TrendDropdown'

interface URLParams {
  provider: string
  owner: string
  repo: string
}

function CoverageTrend() {
  const { repo, owner, provider } = useParams<URLParams>()
  const { data: overview } = useRepoOverview({
    provider,
    repo,
    owner,
  })

  const { data: branchesData } = useBranches({ provider, repo, owner })

  const { selection } = useBranchSelector({
    branches: branchesData?.branches ?? [],
    defaultBranch: overview?.defaultBranch ?? '',
  })

  const { data, isLoading } = useRepoCoverageTimeseries({
    branch: selection?.name,
    options: {
      enabled: !!selection?.name,
      suspense: false,
      keepPreviousData: true,
    },
  })

  return (
    <SummaryField>
      <TrendDropdown />
      <div className="flex items-center gap-2 pb-[1.3rem]">
        {/* ^ CSS doesn't want to render like the others without a p tag in the dom. */}
        {isLoading ? (
          <Spinner />
        ) : data?.measurements?.length > 0 ? (
          <TotalsNumber
            value={data?.measurements[0]?.coverage}
            light
            showChange
          />
        ) : (
          <p className="text-sm font-medium">
            No coverage reports found in this timespan.
          </p>
        )}
      </div>
    </SummaryField>
  )
}
export default CoverageTrend
