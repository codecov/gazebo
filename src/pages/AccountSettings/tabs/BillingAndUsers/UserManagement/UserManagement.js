import PropTypes from 'prop-types'
import { useForm } from 'react-hook-form'

import { FormControls } from './FormControls'
import { DateItem } from './DateItem'
import cs from 'classnames'

import Card from 'ui/Card'
import User from 'ui/User'
import Button from 'ui/Button'

import { useLocationParams, ApiFilterEnum } from 'services/navigation'
import { useUsers, useUpdateUser } from 'services/users'
import { getOwnerImg } from 'shared/utils'

const UserManagementClasses = {
  root: 'space-y-4 col-span-2',
  title: 'text-lg py-3',
  results: 'shadow divide-y divide-gray-200 divide-solid p-4',
  userTable: 'grid grid-cols-4 lg:gap-2 my-6',
  user: ({ lastseen, latestPrivatePrDate }) =>
    cs({
      'col-span-2': !lastseen || !latestPrivatePrDate,
      'col-span-3': !lastseen && !latestPrivatePrDate,
    }),
  ctaWrapper: 'flex items-center',
  cta: 'w-full truncate',
}

function useActivateUser({ provider, owner, query }, opts) {
  const { mutate, ...rest } = useUpdateUser(
    {
      provider,
      owner,
      params: query,
    },
    opts
  )

  function activate(user, activated) {
    return mutate({ targetUser: user, activated })
  }

  return { activate, ...rest }
}

function createPills({ isAdmin, email, student }) {
  return [
    isAdmin ? { label: 'Admin', highlight: true } : null,
    email,
    student ? 'Student' : null,
  ]
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
      ordering: 'name',
    },
  })
  const { data, isSuccess } = useUsers({
    provider,
    owner,
    query: params,
  })
  const { activate } = useActivateUser(
    { owner, provider, query: params },
    {
      onSuccess: (...args) => {
        console.log(args)
        updateQuery()
      },
    }
  )

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
        <h2 className={UserManagementClasses.title}>Users</h2>
        <div>
          {isSuccess &&
            data?.results?.map((user) => (
              <div
                key={user.username}
                className={UserManagementClasses.userTable}
              >
                <User
                  className={UserManagementClasses.user(user)}
                  username={user.username}
                  name={user.name}
                  avatarUrl={getOwnerImg(provider, user.username)}
                  pills={createPills(user)}
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
                <div className={UserManagementClasses.ctaWrapper}>
                  <Button
                    className={UserManagementClasses.cta}
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
