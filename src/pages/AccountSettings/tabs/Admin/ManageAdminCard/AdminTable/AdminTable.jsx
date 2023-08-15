import { useParams } from 'react-router-dom'

import Table from 'old_ui/Table'
import { ApiFilterEnum } from 'services/navigation'
import { useUpdateUser, useUsers } from 'services/users'
import { getOwnerImg } from 'shared/utils'
import Avatar from 'ui/Avatar'
import Button from 'ui/Button'
import Spinner from 'ui/Spinner'

const Loader = () => (
  <div className="mt-16 flex flex-1 items-center justify-center">
    <Spinner />
  </div>
)

const columns = [
  {
    id: 'username',
    header: 'User name',
    accessorKey: 'username',
    width: 'w-3/12',
    cell: (info) => info.getValue(),
    justifyStart: true,
  },
  {
    id: 'email',
    header: 'email',
    accessorKey: 'email',
    width: 'w-6/12',
    cell: (info) => info.getValue(),
    justifyStart: true,
  },
  {
    id: 'revokeAdmin',
    header: '',
    accessorKey: 'revokeAdmin',
    width: 'w-3/12',
    cell: (info) => info.getValue(),
  },
]

const AdminTable = () => {
  const { provider, owner } = useParams()
  const params = { isAdmin: ApiFilterEnum.true }
  const { data: admins, isFetching: isLoadingAdmins } = useUsers({
    provider,
    owner,
    query: params,
  })

  const { mutate, isLoading: isUpdatingUser } = useUpdateUser({
    provider,
    owner,
    params,
  })

  const tableData =
    admins?.results?.map((admin) => {
      admin.avatarUrl = getOwnerImg(provider, admin?.username)

      return {
        username: (
          <div className="flex items-center gap-2">
            <Avatar user={admin} ariaLabel={`${admin?.username}-avatar`} />
            <p>{admin?.username}</p>
          </div>
        ),
        email: admin?.email,
        revokeAdmin: (
          <Button
            hook="toggle admin status"
            disabled={isUpdatingUser}
            onClick={() => {
              mutate({
                targetUserOwnerid: admin.ownerid,
                isAdmin: false,
              })
            }}
          >
            Revoke
          </Button>
        ),
      }
    }) ?? []

  if (!isLoadingAdmins && tableData.length === 0) {
    return (
      <p>
        No admins yet. Note that admins in your Github organization are
        automatically considered admins.
      </p>
    )
  }

  return (
    <>
      <Table columns={columns} data={tableData} />
      {isLoadingAdmins && <Loader />}
    </>
  )
}

export default AdminTable
