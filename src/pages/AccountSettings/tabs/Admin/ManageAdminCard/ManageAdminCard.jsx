import { useParams } from 'react-router-dom'

import { ApiFilterEnum } from 'services/navigation'
import { useUpdateUser } from 'services/users'

import AddAdmins from './AddAdmins'
import AdminTable from './AdminTable'

function ManageAdminCard() {
  const { provider, owner } = useParams()

  const { mutate } = useUpdateUser({
    provider,
    owner,
    params: { isAdmin: ApiFilterEnum.true },
  })

  function setAdminStatus(user, isAdmin) {
    mutate({ targetUserOwnerid: user.ownerid, isAdmin: isAdmin })
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-semibold">Account administrators</h2>
        <p>
          Admins are able to: Add other admins, activate deactivate other users,
          view billing and modify the team yaml.
        </p>
      </div>
      <hr />
      <div className="my-4">
        <AddAdmins
          provider={provider}
          owner={owner}
          setAdminStatus={setAdminStatus}
        />
      </div>
      <div className="max-h-56 overflow-y-auto">
        <AdminTable />
      </div>
    </div>
  )
}

export default ManageAdminCard
