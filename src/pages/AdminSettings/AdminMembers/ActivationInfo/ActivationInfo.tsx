import { Suspense } from 'react'

import Spinner from 'ui/Spinner'

import ActivationCount from './ActivationCount/ActivationCount'
import AutoActivateMembers from './AutoActivateMembers/AutoActivateMembers'

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
