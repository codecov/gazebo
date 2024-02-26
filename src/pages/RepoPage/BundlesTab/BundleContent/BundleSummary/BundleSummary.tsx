import { useCallback, useRef } from 'react'

import { SummaryField, SummaryRoot } from 'ui/Summary'

import BranchSelector from './BranchSelector'
import BundleSelector from './BundleSelector'

const BundleSummary: React.FC = () => {
  const bundleSelectRef = useRef<{ resetSelected: () => void }>(null)

  const resetBundleSelect = useCallback(() => {
    bundleSelectRef.current?.resetSelected()
  }, [])

  return (
    <div className="flex flex-col gap-8 py-4 md:flex-row">
      <div className="flex flex-col gap-4 md:flex-row">
        <BranchSelector resetBundleSelect={resetBundleSelect} />
        <BundleSelector ref={bundleSelectRef} />
      </div>
      <SummaryRoot>
        <SummaryField>
          <p className="text-sm font-semibold">Total size</p>
        </SummaryField>
        <SummaryField>
          <p className="text-sm font-semibold">gzip size</p>
        </SummaryField>
        <SummaryField>
          <p className="text-sm font-semibold">Download time</p>
        </SummaryField>
        <SummaryField>
          <p className="text-sm font-semibold">Modules</p>
        </SummaryField>
      </SummaryRoot>
    </div>
  )
}

export default BundleSummary
