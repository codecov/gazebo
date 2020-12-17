import PropTypes from 'prop-types'
import { useForm, Controller } from 'react-hook-form'
import { useState } from 'react'
import isNil from 'lodash/isNil'

import Select from 'ui/Select'
import Card from 'ui/Card'
import User from 'ui/User'

import { useUsers } from 'services/account'
import { getOwnerImg } from 'shared/utils'

function createQuery({ search, activated, admin, sort }) {
  const queryShape = {
    ...(search && { prefix: search }),
    ...(!isNil(activated?.q) && { activated: activated.q }),
    ...(!isNil(admin?.q) && { is_admin: admin.q }),
    ...(!isNil(sort?.q) && { ordering: sort.q }),
  }
  return queryShape
}

function createUserPills({ student, is_admin, email }) {
  const pills = []

  if (student) pills.push({ text: 'Student' })
  if (is_admin) pills.push({ text: 'Admin', highlight: true })
  if (email) pills.push({ text: email })

  return pills
}

function UserManagement({ provider, owner }) {
  const [query, setQuery] = useState({})
  const { register, handleSubmit, control } = useForm()
  const onSubmit = (data) => {
    setQuery(createQuery(data))
  }

  const { data } = useUsers({
    provider,
    owner,
    query,
  })

  function _SelectEl(name, items) {
    return (
      <Controller
        name={name}
        control={control}
        defaultValue={items[0]}
        render={({ onChange, value }) => (
          <Select
            ariaName={name}
            className="relative flex-1 md:flex-none w-full md:w-auto"
            buttonClass="flex items-center px-2 py-3"
            ulClass="absolute inset-x-0 bottom top-0 z-50 overflow-hidden rounded-md bg-white border-gray-200 outline-none"
            items={items}
            renderItem={({ label }) => (
              <div className="flex justify-between flex-1 p-2 text-base w-full">
                {label}
              </div>
            )}
            onChange={(select) => {
              onChange(select)
              setQuery({ ...query, ...createQuery({ [name]: select }) })
            }}
            value={value}
          />
        )}
      />
    )
  }

  return (
    <form className="space-y-4 col-span-2" onSubmit={handleSubmit(onSubmit)}>
      <Card className="shadow flex flex-wrap divide-x divide-gray-200 divide-solid">
        {_SelectEl('activated', [
          { label: 'Sort Active Users' },
          { label: 'activated', q: true },
          { label: 'deactivated', q: false },
        ])}
        {_SelectEl('admin', [
          { label: 'Sort By Admin' },
          { label: 'Is Admin', q: true },
          { label: 'Not Admin', q: false },
        ])}
        {_SelectEl('sort', [
          { label: 'Sort by Name ⬆', q: 'name' },
          { label: 'Sort by Name ⬇', q: '-name' },
          { label: 'Sort by Username ⬆', q: 'username' },
          { label: 'Sort by Username ⬇', q: '-username' },
          { label: 'Sort by Email ⬆', q: 'email' },
          { label: 'Sort by Email ⬇', q: '-email' },
        ])}
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
          {data?.results?.map((user, i) => (
            <div key={i} className="p-2 flex justify-between">
              <User
                username={user.username}
                name={user.name}
                avatarUrl={getOwnerImg(provider, user.username)}
                pills={createUserPills(user)}
              />
              <span>{user.activated ? 'Activated' : 'Disabled'}</span>
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
