import { useParams } from 'react-router-dom'

import { useUsers } from 'services/users'
import { ApiFilterEnum } from 'services/navigation'
import { getOwnerImg } from 'shared/utils'
import { providerToName } from 'shared/utils/provider'
import Button from 'ui/Button'

function AdminList() {
  const { provider, owner } = useParams()
  const { data: admins } = useUsers({
    provider,
    owner,
    query: {
      isAdmin: ApiFilterEnum.true,
    },
  })

  const nbAdmins = admins?.results?.length ?? 0

  if (nbAdmins === 0) {
    return (
      <p className="text-gray-800">
        No admins yet. Note that admins in your {providerToName(provider)}{' '}
        organization are automatically considered admins.
      </p>
    )
  }

  return (
    <div>
      {admins.results.map((admin) => {
        // temporary until User support a slim variant
        const avatarUrl = getOwnerImg(provider, admin.username)
        return (
          <div className="flex" key={admin.username}>
            <img
              className="rounded-full h-8 w-8 mr-4"
              src={avatarUrl}
              alt={admin.username}
            />
            <p>{admin.name}</p>
            <p>@{admin.username}</p>
            <span className="flex-initial flex text-sm space-x-2 bg-gray-200 text-gray-900 rounded-full px-3">
              {admin.email}
            </span>
            <Button className="ml-auto" variant="outline" color="gray">
              Revoke
            </Button>
          </div>
        )
      })}
    </div>
  )
}

export default AdminList
