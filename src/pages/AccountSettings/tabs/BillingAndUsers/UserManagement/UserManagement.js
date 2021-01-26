import PropTypes from 'prop-types'
import { useForm } from 'react-hook-form'
import formatDistance from 'date-fns/formatDistance'
import parseISO from 'date-fns/parseISO'

import { FormControls } from './FormControls'
import { useLocationParams, ApiFilterEnum } from 'services/navigation'

import Card from 'ui/Card'
import User from 'ui/User'
import Button from 'ui/Button'

import { useUsers, useUpdateUser } from 'services/users'
import { getOwnerImg } from 'shared/utils'

import styles from './UserManagement.module.css'

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

function DateItem({ date, label, testId }) {
  const compare = parseISO(date)
  const today = new Date()
  return (
    <div className="flex flex-col text-sm">
      <span className="font-bold">{label}</span>
      <span data-testid={testId}>
        {date ? formatDistance(compare, today, 'MM/dd/yyyy') : 'never'}
      </span>
    </div>
  )
}

DateItem.propTypes = {
  date: PropTypes.string,
  label: PropTypes.string.isRequired,
  testId: PropTypes.string.isRequired,
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
    <form className="space-y-4 col-span-2" onSubmit={handleSubmit(updateQuery)}>
      <FormControls
        current={params}
        onChange={updateQuery}
        register={register}
        control={control}
      />
      <Card className="shadow divide-y divide-gray-200 divide-solid p-4">
        <div className="pb-4">
          <h2>User List</h2>
          {isSuccess &&
            data?.results?.map((user) => (
              <div key={user.username} className={styles.userTable}>
                <User
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
