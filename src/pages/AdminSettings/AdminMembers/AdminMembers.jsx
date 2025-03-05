import { Suspense } from 'react'

import Spinner from 'ui/Spinner'

import ActivationInfo from './ActivationInfo'
import MemberList from './MemberList'

const Loader = () => (
  <div className="flex items-center justify-center py-16">
    <Spinner />
  </div>
)

function AdminMembers() {
  return (
    <div className="flex w-2/3 flex-col gap-4 sm:mr-4 sm:flex-initial lg:w-3/5">
      <div>
        <h2 className="text-2xl font-semibold">Account Members</h2>
        <p>All members under the organization plan and related management</p>
      </div>
      <Suspense fallback={<Loader />}>
        <hr />
        <ActivationInfo />
        <hr />
        <MemberList />
      </Suspense>
    </div>
  )
}

export default AdminMembers
