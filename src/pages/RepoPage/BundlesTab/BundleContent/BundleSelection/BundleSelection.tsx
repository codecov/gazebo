import { lazy, useCallback, useRef } from 'react'

import BranchSelector from './BranchSelector'
import { LoadSelector } from './LoadSelector'
import { TypeSelector } from './TypeSelector'
const BundleSelector = lazy(() => import('./BundleSelector'))

const BundleSelection: React.FC = () => {
  const bundleSelectRef = useRef<{ resetSelected: () => void }>(null)
  const typesSelectRef = useRef<{ resetSelected: () => void }>(null)
  const loadingSelectRef = useRef<{ resetSelected: () => void }>(null)

  const resetFilterSelects = useCallback(() => {
    typesSelectRef.current?.resetSelected()
    loadingSelectRef?.current?.resetSelected()
  }, [])

  const resetBundleSelect = useCallback(() => {
    bundleSelectRef.current?.resetSelected()
    resetFilterSelects()
  }, [resetFilterSelects])

  return (
    <div className="flex flex-col gap-8 border-b border-ds-gray-tertiary pb-6 pt-4">
      <div className="flex flex-col gap-4 md:w-full md:flex-row md:justify-between">
        <BranchSelector resetBundleSelect={resetBundleSelect} />
        <BundleSelector
          ref={bundleSelectRef}
          resetFilterSelects={resetFilterSelects}
        />
        <TypeSelector ref={typesSelectRef} />
        <LoadSelector ref={loadingSelectRef} />
      </div>
    </div>
  )
}

export default BundleSelection
