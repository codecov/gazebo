import { lazy, useCallback, useRef, useState } from 'react'

import { ConfigureCachedBundleModal } from 'pages/RepoPage/shared/ConfigureCachedBundleModal/ConfigureCachedBundleModal'
import { useFlags } from 'shared/featureFlags'
import Icon from 'ui/Icon'

import BranchSelector from './BranchSelector'
import { LoadSelector } from './LoadSelector'
import { TypeSelector } from './TypeSelector'
const BundleSelector = lazy(() => import('./BundleSelector'))

const BundleSelection: React.FC = () => {
  const bundleSelectRef = useRef<{ resetSelected: () => void }>(null)
  const typesSelectRef = useRef<{ resetSelected: () => void }>(null)
  const loadingSelectRef = useRef<{ resetSelected: () => void }>(null)

  const [showBundleCachingModal, setShowBundleCachingModal] = useState(false)

  const { displayBundleCachingModal } = useFlags({
    displayBundleCachingModal: false,
  })

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
        {displayBundleCachingModal ? (
          <div className="flex w-full justify-end self-start md:w-auto">
            <button
              onClick={() => setShowBundleCachingModal(true)}
              className="flex items-center gap-0.5 text-xs text-ds-blue-darker hover:cursor-pointer hover:underline"
            >
              <Icon name="cog" size="sm" variant="outline" />
              Configure data caching
            </button>
            <ConfigureCachedBundleModal
              isOpen={showBundleCachingModal}
              setIsOpen={setShowBundleCachingModal}
            />
          </div>
        ) : null}
      </div>
    </div>
  )
}

export default BundleSelection
