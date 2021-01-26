import PropTypes from 'prop-types'
import { useForm } from 'react-hook-form'

import { FormControls } from './FormControls'
import { DateItem } from './DateItem'
import { useLocationParams, ApiFilterEnum } from 'services/navigation'

import Card from 'ui/Card'
import User from 'ui/User'
import Button from 'ui/Button'

import { useUsers, useUpdateUser } from 'services/users'
import { getOwnerImg } from 'shared/utils'

const UserManagementClasses = {
  root: 'space-y-4 col-span-2',
  results: 'shadow divide-y divide-gray-200 divide-solid p-4',
  wrapper: 'pb-4',
  userTable: 'grid grid-cols-2 md:grid-cols-5 gap-2',
  user: 'col-span-2',
}

function useActivateUser({ provider, owner, query }) {
  const { mutate, ...rest } = useUpdateUser({
    provider,
    owner,
    params: query,
  })

  function activate(user, activated) {
    return mutate({ targetUser: user, activated })
  }

  return { activate, ...rest }
}

function UserManagement({ provider, owner }) {
  const { params, updateParams } = useLocationParams({
    activated: '',
    isAdmin: '',
    ordering: 'name',
    search: '',
  })
  const { register, handleSubmit, control } = useForm({
    defaultValues: {
      search: params.search,
      activated: ApiFilterEnum.none,
      isAdmin: ApiFilterEnum.none,
      ordering: { label: 'Sort by Name ⬆', value: 'name' },
    },
  })
  const { data, isSuccess } = useUsers({
    provider,
    owner,
    query: params,
  })
  const { activate } = useActivateUser({ owner, provider, query: params })

  function updateQuery(data) {
    updateParams(data)
  }

  return (
    <form
      className={UserManagementClasses.root}
      onSubmit={handleSubmit(updateQuery)}
    >
      <FormControls
        current={params}
        onChange={updateQuery}
        register={register}
        control={control}
      />
      <Card className={UserManagementClasses.results}>
        <div className={UserManagementClasses.wrapper}>
          <h2>User List</h2>
          {isSuccess &&
            data?.results?.map((user) => (
              <div
                key={user.username}
                className={UserManagementClasses.userTable}
              >
                <User
                  className={UserManagementClasses.user}
                  username={user.username}
                  name={user.name}
                  avatarUrl={getOwnerImg(provider, user.username)}
                  student={user.student}
                  isAdmin={user.isAdmin}
                  email={user.email}
                />
                <DateItem
                  testId="last-seen"
                  label="Last seen:"
                  date={user.lastseen}
                />
                <DateItem
                  testId="last-pr"
                  label="Last pr:"
                  date={user.latestPrivatePrDate}
                />
                <div>
                  <Button
                    className="w-full truncate"
                    color={user.activated ? 'red' : 'blue'}
                    variant={user.activated ? 'outline' : 'normal'}
                    onClick={() => activate(user.username, !user.activated)}
                  >
                    {user.activated ? 'Deactivate' : 'Activate'}
                  </Button>
                </div>
              </div>
            ))}
        </div>
        <div className="pt-4">Pagination</div>
      </Card>
    </form>
  )
}

UserManagement.propTypes = {
  provider: PropTypes.string.isRequired,
  owner: PropTypes.string.isRequired,
}

export default UserManagement
