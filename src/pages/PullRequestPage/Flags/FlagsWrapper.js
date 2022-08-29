import { Suspense } from 'react'

import SilentNetworkError from 'layouts/shared/SilentNetworkError'

import Flags from './Flags'

function FlagsWrapper() {
  return (
    <Suspense fallback={null}>
      <SilentNetworkError>
        <Flags />
      </SilentNetworkError>
    </Suspense>
  )
}

export default FlagsWrapper
