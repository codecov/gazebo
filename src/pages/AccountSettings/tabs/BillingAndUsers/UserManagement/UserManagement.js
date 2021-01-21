import PropTypes from 'prop-types'
import { useForm } from 'react-hook-form'
import { useState } from 'react'
import formatDistance from 'date-fns/formatDistance'
import parseISO from 'date-fns/parseISO'

import { FormSelect as Select } from './UserFormSelect'
import createQuery, { FilterEnum } from './formQuery'

import Card from 'ui/Card'
import User from 'ui/User'
import Button from 'ui/Button'

import { useUsers, useUpdateUser } from 'services/users'
import { getOwnerImg } from 'shared/utils'

function createUserPills({ student, isAdmin, email }) {
  const pills = []

  if (student) pills.push({ text: 'Student' })
  if (isAdmin) pills.push({ text: 'Admin', highlight: true })
  if (email) pills.push({ text: email })

  return pills
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
  const [query, setQuery] = useState({})
  const { register, handleSubmit, control } = useForm()
  const { data, isSuccess } = useUsers({
    provider,
    owner,
    query,
  })
  const { activate } = useActivateUser({ owner, provider, query })

  function updateQuery(data) {
    setQuery(createQuery(query, data))
  }
  const onSubmit = (data) => {
    updateQuery(data)
  }

  return (
    <form className="space-y-4 col-span-2" onSubmit={handleSubmit(onSubmit)}>
      <Card className="shadow flex flex-wrap divide-x divide-gray-200 divide-solid">
        <Select
          control={control}
          name="activated"
          items={[
            { label: 'Filter By Activated Users', q: FilterEnum.none },
            { label: 'activated', q: FilterEnum.true },
            { label: 'deactivated', q: FilterEnum.false },
          ]}
          handleOnChange={(select, name) => {
            updateQuery({ [name]: select })
          }}
        />
        <Select
          control={control}
          name="isAdmin"
          items={[
            { label: 'Filter By Admin', q: FilterEnum.none },
            { label: 'Is Admin', q: FilterEnum.true },
            { label: 'Not Admin', q: FilterEnum.false },
          ]}
          handleOnChange={(select, name) => {
            updateQuery({ [name]: select })
          }}
        />
        <Select
          control={control}
          name="ordering"
          items={[
            { label: 'Sort by Name ⬆', q: 'name' },
            { label: 'Sort by Name ⬇', q: '-name' },
            { label: 'Sort by Username ⬆', q: 'username' },
            { label: 'Sort by Username ⬇', q: '-username' },
            { label: 'Sort by Email ⬆', q: 'email' },
            { label: 'Sort by Email ⬇', q: '-email' },
          ]}
          handleOnChange={(select, name) => {
            updateQuery({ [name]: select })
          }}
        />

        <input
          aria-label="search users"
          className="flex-2 px-2 py-3 rounded w-full md:w-auto"
          name="search"
          ref={register}
          placeholder="Search"
        />
        <input
          className="block md:hidden sr:block bg-gray-100 flex-2 px-2 py-3 rounded w-full"
          type="submit"
          value="Submit"
        />
      </Card>
      <Card className="shadow divide-y divide-gray-200 divide-solid p-4">
        <div className="pb-4">
          <h2>User List</h2>
          {isSuccess &&
            data?.results?.map((user) => (
              <div key={user.username} className="p-2 grid grid-cols-5 gap-4">
                <User
                  className="col-span-2"
                  username={user.username}
                  name={user.name}
                  avatarUrl={getOwnerImg(provider, user.username)}
                  pills={createUserPills(user)}
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
                    className="w-full"
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
