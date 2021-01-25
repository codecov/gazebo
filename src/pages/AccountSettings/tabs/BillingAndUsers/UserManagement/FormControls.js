import PropTypes from 'prop-types'
import find from 'lodash/find'

import { FormSelect as Select } from './UserFormSelect'
import { ApiFilterEnum } from 'services/navigation'

import Card from 'ui/Card'

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

export function FormControls({
  control,
  register,
  onChange,
  current,
  fetching = false,
}) {
  return (
    <Card className="shadow flex flex-wrap divide-x divide-gray-200 divide-solid">
      <Select
        control={control}
        name="activated"
        items={ActivatedItems}
        selected={find(
          ActivatedItems,
          ({ value }) => value === current?.activated
        )}
        handleOnChange={({ value }, name) => {
          onChange({ [name]: value })
        }}
      />
      <Select
        control={control}
        name="isAdmin"
        items={AdminItems}
        selected={find(AdminItems, ({ value }) => value === current?.isAdmin)}
        handleOnChange={({ value }, name) => {
          onChange({ [name]: value })
        }}
      />
      <Select
        control={control}
        name="ordering"
        items={OrderingItems}
        selected={find(
          OrderingItems,
          ({ value }) => value === current?.ordering
        )}
        handleOnChange={({ value }, name) => {
          onChange({ [name]: value })
        }}
      />
      <input
        aria-label="search users"
        className="flex-2 px-2 py-3 rounded w-full md:w-auto"
        name="search"
        ref={register}
        placeholder="Search"
        onChange={(event) => onChange({ search: event.target.value })}
      />
      {fetching && <p>Fetching</p>}
      <input
        className="block md:hidden sr:block bg-gray-100 flex-2 px-2 py-3 rounded w-full"
        type="submit"
        value="Submit"
      />
    </Card>
  )
}

FormControls.propTypes = {
  onChange: PropTypes.func.isRequired,
  register: PropTypes.func.isRequired,
  control: PropTypes.object.isRequired,
  current: PropTypes.object.isRequired,
  fetching: PropTypes.bool,
}
