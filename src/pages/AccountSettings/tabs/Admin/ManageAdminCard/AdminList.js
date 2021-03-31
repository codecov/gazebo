import { useParams } from 'react-router-dom'

import { useUsers, useUpdateUser } from 'services/users'
import { ApiFilterEnum } from 'services/navigation'
import { getOwnerImg } from 'shared/utils'
import { providerToName } from 'shared/utils/provider'
import Button from 'old_ui/Button'
import User from 'old_ui/User'

import AddAdmins from './AddAdmins'

function useAdminsAndRevoke({ provider, owner }) {
  const params = { isAdmin: ApiFilterEnum.true }
  const { data } = useUsers({
    provider,
    owner,
    query: params,
  })
  const { mutate, isLoading } = useUpdateUser({ provider, owner, params })

  function setAdminStatus(user, isAdmin) {
    const body = {
      /* eslint-disable camelcase */
      targetUser: user.username,
      is_admin: isAdmin,
      /* eslint-enable camelcase */
    }
    mutate(body)
  }

  return {
    admins: data?.results ?? [],
    setAdminStatus,
    isLoading,
  }
}

function AdminList() {
  const { provider, owner } = useParams()
  const { admins, setAdminStatus, isLoading } = useAdminsAndRevoke({
    provider,
    owner,
  })

  return (
    <>
      <div className="mb-4">
        <AddAdmins
          provider={provider}
          owner={owner}
          setAdminStatus={setAdminStatus}
        />
      </div>
      <div className="max-h-56 overflow-y-auto">
        {admins.length === 0 ? (
          <p className="text-gray-800">
            No admins yet. Note that admins in your {providerToName(provider)}{' '}
            organization are automatically considered admins.
          </p>
        ) : (
          admins.map((admin) => (
            <div
              className="flex border-t border-gray-200 first:border-0 py-2"
              key={admin.username}
            >
              <User
                avatarUrl={getOwnerImg(provider, admin.username)}
                name={admin.name}
                username={admin.username}
                pills={[admin.email]}
                compact
              />
              <Button
                disabled={isLoading}
                className="ml-auto"
                variant="outline"
                color="gray"
                onClick={() => setAdminStatus(admin, false)}
              >
                Revoke
              </Button>
            </div>
          ))
        )}
      </div>
    </>
  )
}

export default AdminList
