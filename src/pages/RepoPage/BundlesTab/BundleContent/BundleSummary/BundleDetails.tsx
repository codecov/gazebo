import { useParams } from 'react-router-dom'

import { useBundleSummary } from 'services/bundleAnalysis/useBundleSummary'
import {
  formatSizeToString,
  formatTimeToString,
} from 'shared/utils/bundleAnalysis'
import { SummaryField, SummaryRoot } from 'ui/Summary'

const NoDetails: React.FC = () => {
  return (
    <SummaryRoot>
      <SummaryField>
        <h3 className="text-center text-sm font-semibold">Total size</h3>
        <div className="flex items-center justify-center">-</div>
        <div />
      </SummaryField>
      <SummaryField>
        <h3 className="text-center text-sm font-semibold">gzip size (est.)</h3>
        <div className="flex items-center justify-center">-</div>
        <div />
      </SummaryField>
      <SummaryField>
        <h3 className="text-center text-sm font-semibold">
          Download time (est.)
        </h3>
        <div className="flex items-center justify-center">-</div>
        <div />
      </SummaryField>
      <SummaryField>
        <h3 className="text-center text-sm font-semibold">Modules</h3>
        <div className="flex items-center justify-center">-</div>
        <div />
      </SummaryField>
    </SummaryRoot>
  )
}

interface URLParams {
  provider: string
  owner: string
  repo: string
  branch?: string
  bundle?: string
}

const BundleDetails: React.FC = () => {
  const {
    provider,
    owner,
    repo,
    branch,
    bundle: bundleParam,
  } = useParams<URLParams>()

  const bundle = bundleParam ?? ''

  const { data: summaryData } = useBundleSummary({
    provider,
    owner,
    repo,
    branch,
    bundle,
    opts: { enabled: bundle !== '' },
  })

  if (!bundle || !summaryData || !summaryData.bundleSummary) {
    return <NoDetails />
  }

  const summary = summaryData.bundleSummary

  return (
    <SummaryRoot>
      <SummaryField>
        <h3 className="text-center text-sm font-semibold">Total size</h3>
        <div className="flex items-center justify-center">
          {formatSizeToString(summary.bundleData.size.uncompress)}
        </div>
        <div />
      </SummaryField>
      <SummaryField>
        <h3 className="text-center text-sm font-semibold">gzip size (est.)</h3>
        <div className="flex items-center justify-center">
          {formatSizeToString(summary.bundleData.size.gzip)}
        </div>
        <div />
      </SummaryField>
      <SummaryField>
        <h3 className="text-center text-sm font-semibold">
          Download time (est.)
        </h3>
        <div className="flex flex-col items-center justify-center">
          <p>
            {formatTimeToString(summary.bundleData.loadTime.threeG)} |{' '}
            {formatTimeToString(summary.bundleData.loadTime.highSpeed)}
          </p>
          <p className="text-xs">(3G | high speed)</p>
        </div>
        <div />
      </SummaryField>
      <SummaryField>
        <h3 className="text-center text-sm font-semibold">Modules</h3>
        <div className="flex items-center justify-center">
          {summary.moduleCount}
        </div>
        <div />
      </SummaryField>
    </SummaryRoot>
  )
}

export default BundleDetails
