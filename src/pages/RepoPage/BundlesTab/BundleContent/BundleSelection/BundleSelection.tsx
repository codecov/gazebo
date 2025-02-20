import { useCallback, useRef, useState } from 'react'

import { ConfigureCachedBundleModal } from 'pages/RepoPage/shared/ConfigureCachedBundleModal/ConfigureCachedBundleModal'
import Icon from 'ui/Icon'

import BranchSelector from './BranchSelector'
import BundleSelector from './BundleSelector'
import { LoadSelector } from './LoadSelector'
import { TypeSelector } from './TypeSelector'

const BundleSelection: React.FC = () => {
  const bundleSelectRef = useRef<{ resetSelected: () => void }>(null)
  const typesSelectRef = useRef<{ resetSelected: () => void }>(null)
  const loadingSelectRef = useRef<{ resetSelected: () => void }>(null)

  const [showBundleCachingModal, setShowBundleCachingModal] = useState(false)

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
        <div className="flex w-full justify-end self-start md:w-auto">
          <button
            onClick={() => setShowBundleCachingModal(true)}
            className="flex items-center gap-0.5 text-xs font-semibold text-ds-blue-darker hover:cursor-pointer hover:underline"
          >
            <Icon name="cog" size="sm" variant="outline" />
            Configure data caching
          </button>
          <ConfigureCachedBundleModal
            isOpen={showBundleCachingModal}
            setIsOpen={setShowBundleCachingModal}
          />
        </div>
      </div>
    </div>
  )
}

export default BundleSelection
