import { useParams } from 'react-router-dom'

import { useBundleSummary } from 'services/bundleAnalysis/useBundleSummary'
import { useLocationParams } from 'services/navigation/useLocationParams'
import {
  formatSizeToString,
  formatTimeToString,
} from 'shared/utils/bundleAnalysis'
import { SummaryField } from 'ui/Summary'

export const NoDetails: React.FC = () => {
  return (
    <div className="flex flex-col justify-between divide-y border-b py-4 lg:flex-row lg:divide-x lg:divide-y-0">
      <div className="w-full pb-2 lg:pb-0">
        <SummaryField>
          <h3 className="text-center text-sm font-semibold">Total size</h3>
          <div className="flex items-center justify-center">-</div>
          <div />
        </SummaryField>
      </div>
      <div className="w-full py-2 lg:py-0">
        <SummaryField>
          <h3 className="text-center text-sm font-semibold">
            gzip size (est.)
          </h3>
          <div className="flex items-center justify-center">-</div>
          <div />
        </SummaryField>
      </div>
      <div className="w-full py-2 lg:py-0">
        <SummaryField>
          <h3 className="text-center text-sm font-semibold">
            Download time (est.)
          </h3>
          <div className="flex flex-col items-center justify-center">
            <p>-</p>
            <p className="text-xs">(3G | high speed)</p>
          </div>
          <div />
        </SummaryField>
      </div>
      <div className="w-full pt-2 lg:pt-0">
        <SummaryField>
          <h3 className="text-center text-sm font-semibold">Modules</h3>
          <div className="flex items-center justify-center">-</div>
          <div />
        </SummaryField>
      </div>
    </div>
  )
}

interface URLParams {
  provider: string
  owner: string
  repo: string
  branch?: string
  bundle?: string
}

export const BundleDetails: React.FC = () => {
  const {
    provider,
    owner,
    repo,
    branch,
    bundle: bundleParam,
  } = useParams<URLParams>()
  const { params } = useLocationParams()

  const bundle = bundleParam ?? ''

  // @ts-expect-error - useLocationParams needs fixing
  const types = params?.types ?? []
  // @ts-expect-error - useLocationParams needs fixing
  const loadTypes = params?.loading ?? []

  const { data: summaryData } = useBundleSummary({
    provider,
    owner,
    repo,
    branch,
    bundle,
    filters: {
      reportGroups: types,
      loadTypes: loadTypes,
    },
  })

  if (!bundle || !summaryData || !summaryData.bundleSummary) {
    return <NoDetails />
  }

  const summary = summaryData.bundleSummary

  return (
    <div className="flex flex-col justify-between divide-y border-b py-4 lg:flex-row lg:divide-x lg:divide-y-0">
      <div className="w-full pb-2 lg:pb-0">
        <SummaryField>
          <h3 className="text-center text-sm font-semibold">Total size</h3>
          <div className="flex items-center justify-center">
            {formatSizeToString(summary.bundleData.size.uncompress)}
          </div>
          <div />
        </SummaryField>
      </div>
      <div className="w-full py-2 lg:py-0">
        <SummaryField>
          <h3 className="text-center text-sm font-semibold">
            gzip size (est.)
          </h3>
          <div className="flex items-center justify-center">
            {formatSizeToString(summary.bundleData.size.gzip)}
          </div>
          <div />
        </SummaryField>
      </div>
      <div className="w-full py-2 lg:py-0">
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
      </div>
      <div className="w-full pt-2 lg:pt-0">
        <SummaryField>
          <h3 className="text-center text-sm font-semibold">Modules</h3>
          <div className="flex items-center justify-center">
            {summary.moduleCount}
          </div>
          <div />
        </SummaryField>
      </div>
    </div>
  )
}
