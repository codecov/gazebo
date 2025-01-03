import { lazy, Suspense } from 'react'

import Spinner from 'ui/Spinner'

const ActivationCount = lazy(() => import('./ActivationCount/ActivationCount'))
const AutoActivateMembers = lazy(
  () => import('./AutoActivateMembers/AutoActivateMembers')
)

const Loader = () => (
  <div className="flex items-center justify-center py-16">
    <Spinner />
  </div>
)

function ActivationInfo() {
  return (
    <Suspense fallback={<Loader />}>
      <ActivationCount />
      <AutoActivateMembers />
    </Suspense>
  )
}

export default ActivationInfo
