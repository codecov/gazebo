import { keepPreviousData } from '@tanstack/react-queryV5'
import { useParams } from 'react-router-dom'

import { useBranches } from 'services/branches/useBranches'
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

  console.log(
    "this may be where it's getting called without a search term the first call"
  )

  const { data: branchesData } = useBranches({ provider, repo, owner })

  const { selection } = useBranchSelector({
    branches: branchesData?.branches ?? [],
    defaultBranch: overview?.defaultBranch ?? '',
  })

  const { data, isPending, isSuccess } = useRepoCoverageTimeseries({
    branch: selection?.name,
    options: { enabled: !!selection?.name, placeholderData: keepPreviousData },
  })

  return (
    <SummaryField>
      <TrendDropdown />
      <div className="flex items-center gap-2 pb-[1.3rem]">
        {/* ^ CSS doesn't want to render like the others without a p tag in the dom. */}
        {isPending ? (
          <Spinner />
        ) : isSuccess && data.measurements.length > 0 ? (
          <TotalsNumber value={data?.coverageChange ?? 0} light showChange />
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
