import { Suspense } from 'react'

import Card from 'ui/Card'
import Spinner from 'ui/Spinner'

import AdminList from './AdminList'

const Loader = () => (
  <div className="flex items-center justify-center py-16">
    <Spinner />
  </div>
)

function ManageAdminCard() {
  return (
    <Card className="flex flex-col gap-2 p-8">
      <h2 className="text-lg font-semibold">Account administrators</h2>
      <p>
        Admins are able to: Add other admins, activate deactivate other users,
        view billing and modify the team yaml.
      </p>
      <Suspense fallback={Loader}>
        <AdminList />
      </Suspense>
    </Card>
  )
}

export default ManageAdminCard
