import { Suspense } from 'react'

import Card from 'old_ui/Card'
import LogoSpinner from 'old_ui/LogoSpinner'

import AdminList from './AdminList'

function ManageAdminCard() {
  const loadingState = <LogoSpinner size={40} />

  return (
    <Card className="p-10">
      <h2 className="text-2xl">Account administrators</h2>
      <p className="mb-4 mt-2">
        Admins are able to: Add other admins, activate deactivate other users,
        view billing and modify the team yaml.
      </p>
      <Suspense fallback={loadingState}>
        <AdminList />
      </Suspense>
    </Card>
  )
}

export default ManageAdminCard
