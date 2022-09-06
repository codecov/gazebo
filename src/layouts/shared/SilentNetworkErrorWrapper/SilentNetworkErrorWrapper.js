import { Suspense } from 'react'

import SilentNetworkError from 'layouts/shared/SilentNetworkError'

// IMPORTANT! Make sure to lazy load the children component
function SilentNetworkErrorWrapper({ children }) {
  return (
    <Suspense fallback={null}>
      <SilentNetworkError>{children}</SilentNetworkError>
    </Suspense>
  )
}

export default SilentNetworkErrorWrapper
