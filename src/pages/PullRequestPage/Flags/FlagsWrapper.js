import { Suspense } from 'react'

import Flags from './Flags'
import FlagsErrorBoundary from './FlagsErrorBoundary'

function FlagsWrapper() {
  return (
    <Suspense>
      <FlagsErrorBoundary>
        <Flags />
      </FlagsErrorBoundary>
    </Suspense>
  )
}

export default FlagsWrapper
