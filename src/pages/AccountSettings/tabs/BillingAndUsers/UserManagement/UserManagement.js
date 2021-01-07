import PropTypes from 'prop-types'
import { useForm, Controller } from 'react-hook-form'
import { useState } from 'react'

import Select from 'ui/Select'
import Card from 'ui/Card'
import User from 'ui/User'

import { useUsers } from 'services/users'
import { getOwnerImg } from 'shared/utils'

const FilterEnum = Object.freeze({ none: 0, true: 1, false: 2 })

function filterQuery(key, value) {
  if (value === FilterEnum.none) return { [key]: '' }
  if (value === FilterEnum.true) return { [key]: 'True' } // API only accepts string with capital letter...
  if (value === FilterEnum.false) return { [key]: 'False' } // API only accepts string with capital letter...
}

function createQuery(
  prev,
  { search, activated, isAdmin: is_admin, ordering } = {}
) {
  const queryShape = {
    ...prev,
    ...(search && { search }),
    ...(ordering && { ordering: ordering.q }),
    ...filterQuery('activated', activated?.q),
    ...filterQuery('is_admin', is_admin?.q),
  }

  return queryShape
}

function createUserPills({ student, isAdmin, email }) {
  const pills = []

  if (student) pills.push({ text: 'Student' })
  if (isAdmin) pills.push({ text: 'Admin', highlight: true })
  if (email) pills.push({ text: email })

  return pills
}

function UserManagement({ provider, owner }) {
  const [query, setQuery] = useState({})
  const { register, handleSubmit, control } = useForm()
  const onSubmit = (data) => {
    setQuery(createQuery(query, data))
  }
  const { data, isSuccess } = useUsers({
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
              setQuery(createQuery(query, { [name]: select }))
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
          { label: 'Filter By Activated Users', q: FilterEnum.none },
          { label: 'activated', q: FilterEnum.true },
          { label: 'deactivated', q: FilterEnum.false },
        ])}
        {_SelectEl('isAdmin', [
          { label: 'Filter By Admin', q: FilterEnum.none },
          { label: 'Is Admin', q: FilterEnum.true },
          { label: 'Not Admin', q: FilterEnum.false },
        ])}
        {_SelectEl('ordering', [
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
          {isSuccess &&
            data?.results?.map((user, i) => (
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
