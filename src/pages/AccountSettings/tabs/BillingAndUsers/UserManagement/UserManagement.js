import PropTypes from 'prop-types'
import { useForm } from 'react-hook-form'
import find from 'lodash/find'

import { FormSelect as Select } from './UserFormSelect'
import {
  useLocationParams,
  normalizeFormData,
  ApiFilterEnum,
  getApiFilterEnum,
} from 'services/navigation'

import Card from 'ui/Card'
import User from 'ui/User'

import { useUsers } from 'services/users'
import { getOwnerImg } from 'shared/utils'

const OrderingItems = [
  { label: 'Sort by Name ⬆', value: 'name' },
  { label: 'Sort by Name ⬇', value: '-name' },
  { label: 'Sort by Username ⬆', value: 'username' },
  { label: 'Sort by Username ⬇', value: '-username' },
  { label: 'Sort by Email ⬆', value: 'email' },
  { label: 'Sort by Email ⬇', value: '-email' },
]

const AdminItems = [
  { label: 'Filter By Admin', value: ApiFilterEnum.none },
  { label: 'Is Admin', value: ApiFilterEnum.true },
  { label: 'Not Admin', value: ApiFilterEnum.false },
]

const ActivatedItems = [
  { label: 'Filter By Activated Users', value: ApiFilterEnum.none },
  { label: 'activated', value: ApiFilterEnum.true },
  { label: 'deactivated', value: ApiFilterEnum.false },
]

function createUserPills({ student, isAdmin, email }) {
  const pills = []

  if (student) pills.push({ text: 'Student' })
  if (isAdmin) pills.push({ text: 'Admin', highlight: true })
  if (email) pills.push({ text: email })

  return pills
}

function UserManagement({ provider, owner }) {
  const { params, setParams } = useLocationParams({
    activated: '',
    isAdmin: '',
    ordering: 'name',
    search: '',
  })
  const { register, handleSubmit, control, getValues } = useForm({
    defaultValues: {
      search: params.search,
      activated: ActivatedItems[0],
      isAdmin: AdminItems[0],
      ordering: OrderingItems[0],
    },
  })
  const { data, isSuccess, isFetching } = useUsers({
    provider,
    owner,
    query: params,
  })

  function updateQuery(data) {
    // Combine previous params with new form data
    setParams({
      ...params,
      ...normalizeFormData(data),
    })
  }

  return (
    <form className="space-y-4 col-span-2" onSubmit={handleSubmit(updateQuery)}>
      <Card className="shadow flex flex-wrap divide-x divide-gray-200 divide-solid">
        <Select
          control={control}
          name="activated"
          items={ActivatedItems}
          selected={find(
            ActivatedItems,
            ({ value }) => value === getApiFilterEnum(params?.activated)
          )}
          handleOnChange={({ value }, name) => {
            updateQuery({ [name]: value })
          }}
        />
        <Select
          control={control}
          name="isAdmin"
          items={AdminItems}
          selected={find(
            AdminItems,
            ({ value }) => value === getApiFilterEnum(params?.isAdmin)
          )}
          handleOnChange={({ value }, name) => {
            updateQuery({ [name]: value })
          }}
        />
        <Select
          control={control}
          name="ordering"
          items={OrderingItems}
          selected={find(
            OrderingItems,
            ({ value }) => value === params?.ordering
          )}
          handleOnChange={({ value }, name) => {
            updateQuery({ [name]: value })
          }}
        />
        <input
          aria-label="search users"
          className="flex-2 px-2 py-3 rounded w-full md:w-auto"
          name="search"
          ref={register}
          placeholder="Search"
          onChange={() => updateQuery(getValues())}
        />
        {isFetching && <p>Fetching</p>}
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
              <div key={user.username} className="p-2 flex justify-between">
                <User
                  username={user.username}
                  name={user.name}
                  avatarUrl={getOwnerImg(provider, user.username)}
                  pills={createUserPills(user)}
                />
                <span>{user?.activated ? 'Activated' : 'Disabled'}</span>
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
