import { useCallback, useRef } from 'react'

import BranchSelector from './BranchSelector'
import BundleDetails from './BundleDetails'
import BundleSelector from './BundleSelector'

const BundleSummary: React.FC = () => {
  const bundleSelectRef = useRef<{ resetSelected: () => void }>(null)

  const resetBundleSelect = useCallback(() => {
    bundleSelectRef.current?.resetSelected()
  }, [])

  return (
    <div className="flex flex-col gap-8 py-4 md:flex-row md:justify-between">
      <div className="flex flex-col gap-4 md:flex-row">
        <BranchSelector resetBundleSelect={resetBundleSelect} />
        <BundleSelector ref={bundleSelectRef} />
      </div>
      <BundleDetails />
    </div>
  )
}

export default BundleSummary
