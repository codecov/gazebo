import { useForm, Controller } from 'react-hook-form'

import Select from 'ui/Select'
import Card from 'ui/Card'

function UserManagement() {
  const { register, handleSubmit, control } = useForm()
  const onSubmit = (data) => alert(JSON.stringify(data))

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <Card className="shadow">
        <div className="flex">
          <Controller
            name="special"
            control={control}
            render={({ onChange, value }) => (
              <Select
                items={[{ label: 'Educator' }, { label: 'Student' }]}
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
                  { key: 'A', label: 'Select..' },
                  { key: 'B', label: 'Cat' },
                  { key: 'C', label: 'Dog' },
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
                  { label: 'Sort by Name ⬆' },
                  { label: 'Sort by Name ⬇' },
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
            className="flex-2 p-2"
            name="search"
            ref={register}
            placeholder="Search"
          />

          <input className="hidden sr:block" type="submit" value="Search" />
        </div>
      </Card>
      <Card className="shadow divide-y divide-gray-200 divide-solid p-4">
        <div className="pb-4">User List</div>
        <div className="pt-4">Pagination</div>
      </Card>
    </form>
  )
}

UserManagement.propTypes = {}

export default UserManagement
