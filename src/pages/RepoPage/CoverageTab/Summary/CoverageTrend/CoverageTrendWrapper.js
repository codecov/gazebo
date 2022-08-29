import { lazy, Suspense } from 'react'

import SilentNetworkError from 'layouts/shared/SilentNetworkError'

const CoverageTrend = lazy(() => import('./CoverageTrend'))

function CoverageTrendWrapper() {
  return (
    <Suspense fallback={null}>
      <SilentNetworkError>
        <CoverageTrend />
      </SilentNetworkError>
    </Suspense>
  )
}

export default CoverageTrendWrapper
