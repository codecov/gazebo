import { useParams } from 'react-router-dom'

import { useRepoOverview } from 'services/repo'
import { SummaryField } from 'ui/Summary'
import TotalsNumber from 'ui/TotalsNumber'

import { useBranchSelector, useRepoCoverageTimeseries } from '../../hooks'
import TrendDropdown from '../TrendDropdown'

function CoverageTrend() {
  const { repo, owner, provider } = useParams()
  const { data: overview } = useRepoOverview({
    provider,
    repo,
    owner,
  })
  const { selection } = useBranchSelector(
    overview?.branches,
    overview?.defaultBranch
  )

  const { coverageChange, isSuccess, coverage } = useRepoCoverageTimeseries({
    branch: selection?.name,
    options: { enabled: !!selection?.name, suspense: false },
  })

  return (
    isSuccess && (
      <SummaryField>
        <TrendDropdown />
        <div className="flex gap-2 pb-[1.3rem]">
          {/* ^ CSS doesn't want to render like the others without a p tag in the dom. */}
          {coverage?.length > 0 ? (
            <>
              <TotalsNumber value={coverageChange} light showChange />
            </>
          ) : (
            <p className="text-sm font-medium">
              No coverage reports found in this timespan.
            </p>
          )}
        </div>
      </SummaryField>
    )
  )
}
export default CoverageTrend
