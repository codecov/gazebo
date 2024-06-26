import { lazy, Suspense, useCallback, useRef } from 'react'

import BranchSelector from './BranchSelector'
import { NoDetails } from './BundleDetails'

const BundleDetails = lazy(() => import('./BundleDetails'))
const BundleSelector = lazy(() => import('./BundleSelector'))

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
      <Suspense fallback={<NoDetails />}>
        <BundleDetails />
      </Suspense>
    </div>
  )
}

export default BundleSummary
