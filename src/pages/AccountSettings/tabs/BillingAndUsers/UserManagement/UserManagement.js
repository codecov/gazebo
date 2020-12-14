import PropTypes from 'prop-types'
import { useForm, Controller } from 'react-hook-form'
import { useState } from 'react'

import Select from 'ui/Select'
import Card from 'ui/Card'

import { useUsers } from 'services/account'

function createQuery({ search, special, filter, order }) {
  return {
    search,
    special: special.q,
    filter: filter.q,
    order: order.q,
  }
}

function UserManagement({ provider, owner }) {
  const [query, setQuery] = useState(null)
  const { register, handleSubmit, control } = useForm()
  const onSubmit = (data) => setQuery(createQuery(data))

  const data = useUsers({
    provider,
    owner,
    query,
  })

  console.log(data)

  return (
    <form className="space-y-4 col-span-2" onSubmit={handleSubmit(onSubmit)}>
      <Card className="shadow flex">
        <Controller
          name="special"
          control={control}
          render={({ onChange, value }) => (
            <Select
              items={[
                { label: 'Educator', q: '-special' },
                { label: 'Student', q: '+special' },
              ]}
              renderItem={(o) => (
                <div className="flex justify-between flex-1 p-2 text-base w-full">
                  <span className="capitalize text-gray-600">{o?.label}</span>
                </div>
              )}
              onChange={onChange}
              value={value}
            />
          )}
        />

        <Controller
          name="filter"
          control={control}
          render={({ onChange, value }) => (
            <Select
              items={[
                { key: 'A', label: 'Select..', q: '-filter' },
                { key: 'B', label: 'Cat', q: '+filter' },
                { key: 'C', label: 'Dog', q: '-filter' },
              ]}
              renderItem={(o) => (
                <div className="flex justify-between flex-1 p-2 text-base w-full">
                  <span className="capitalize text-gray-600">{o?.label}</span>
                  {o?.key}
                </div>
              )}
              onChange={onChange}
              value={value}
            />
          )}
        />

        <Controller
          name="order"
          control={control}
          render={({ onChange, value }) => (
            <Select
              items={[
                { label: 'Sort by Name ⬆', q: '+order' },
                { label: 'Sort by Name ⬇', q: '-order' },
              ]}
              renderItem={(o) => (
                <div className="flex justify-between flex-1 p-2 text-base w-full">
                  <span className="capitalize text-gray-600">{o?.label}</span>
                </div>
              )}
              onChange={onChange}
              value={value}
            />
          )}
        />
        <input
          className="flex-3 p-2 rounded"
          name="search"
          ref={register}
          placeholder="Search"
        />

        <input className="hidden sr:block" type="submit" value="Search" />
      </Card>
      <Card className="shadow divide-y divide-gray-200 divide-solid p-4">
        <div className="pb-4">User List</div>
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
