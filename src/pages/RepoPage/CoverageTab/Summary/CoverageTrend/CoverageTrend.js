import ErrorBoundary from 'layouts/shared/ErrorBoundary'
import Sparkline from 'ui/Sparkline'
import { SummaryField } from 'ui/Summary'
import TotalsNumber from 'ui/TotalsNumber'

import { useSummary } from '../hooks'
import TrendDropdown from '../TrendDropdown'

function CoverageTrend() {
  const {
    coverage,
    currentBranchSelected,
    coverageChange,
    legacyApiIsSuccess,
  } = useSummary()

  return (
    <ErrorBoundary errorComponent={null}>
      {legacyApiIsSuccess && (
        <SummaryField>
          <TrendDropdown />
          <div className="flex gap-2 pb-[1.3rem]">
            {/* ^ CSS doesn't want to render like the others without a p tag in the dom. */}
            {coverage?.length > 0 ? (
              <>
                <Sparkline
                  datum={coverage}
                  description={`The ${currentBranchSelected?.name} branch coverage trend`}
                  dataTemplate={(d) => `coverage: ${d}%`}
                  select={(d) => d?.coverage}
                />
                <TotalsNumber value={coverageChange} light showChange />
              </>
            ) : (
              <p className="text-sm font-medium">
                No coverage reports found in this timespan.
              </p>
            )}
          </div>
        </SummaryField>
      )}
    </ErrorBoundary>
  )
}
export default CoverageTrend
