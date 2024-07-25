import { lazy, useCallback, useRef } from 'react'

import BranchSelector from './BranchSelector'
const BundleSelector = lazy(() => import('./BundleSelector'))

const BundleSelection: React.FC = () => {
  const bundleSelectRef = useRef<{ resetSelected: () => void }>(null)

  const resetBundleSelect = useCallback(() => {
    bundleSelectRef.current?.resetSelected()
  }, [])

  return (
    <div className="flex flex-col gap-8 border-b border-ds-gray-tertiary pb-6 pt-4 md:flex-row md:justify-between">
      <div className="flex flex-col gap-4 md:flex-row">
        <BranchSelector resetBundleSelect={resetBundleSelect} />
        <BundleSelector ref={bundleSelectRef} />
      </div>
    </div>
  )
}

export default BundleSelection
