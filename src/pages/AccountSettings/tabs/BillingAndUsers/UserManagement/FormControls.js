import PropTypes from 'prop-types'
import find from 'lodash/find'

import Select from 'ui/Select'
import { ApiFilterEnum } from 'services/navigation'

import Card from 'ui/Card'
import Icon from 'ui/Icon'

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

const FormClasses = {
  root: 'shadow flex divide-x divide-gray-200 divide-solid',
  search: 'flex-auto px-2 py-4 w-full rounded-tr-md rounded-br-md md:w-auto',
  submit: 'hidden sr:block bg-gray-100 flex-2 px-2 py-3',
  firstFilter: 'rounded-tl-md rounded-bl-md pl-2',
  item: 'flex-1 flex justify-between text-base p-4 truncate',
  itemContent: 'flex justify-between flex-1 text-base truncate',
}

export function FormControls({ control, register, onChange, current }) {
  return (
    <Card className={FormClasses.root}>
      <Select
        className={FormClasses.firstFilter}
        control={control}
        name="activated"
        items={ActivatedItems}
        renderItem={({ label, value } = {}) => (
          <span className={FormClasses.item}>
            <Icon
              name={value === current?.activated ? 'building' : 'setting'}
            />
            <span className={FormClasses.itemContent}>{label}</span>
          </span>
        )}
        value={find(
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
        renderItem={({ label } = {}) => (
          <span className={FormClasses.item}>
            <span className={FormClasses.itemContent}>{label}</span>
          </span>
        )}
        value={find(AdminItems, ({ value }) => value === current?.isAdmin)}
        handleOnChange={({ value }, name) => {
          onChange({ [name]: value })
        }}
      />
      <Select
        control={control}
        name="ordering"
        items={OrderingItems}
        renderItem={({ label } = {}) => (
          <span className={FormClasses.item}>
            <span className={FormClasses.itemContent}>{label}</span>
          </span>
        )}
        value={find(OrderingItems, ({ value }) => value === current?.ordering)}
        handleOnChange={({ value }, name) => {
          onChange({ [name]: value })
        }}
      />
      <input
        aria-label="search users"
        className={FormClasses.search}
        name="search"
        ref={register}
        placeholder="Search"
        onChange={(event) => onChange({ search: event.target.value })}
      />
      <input className={FormClasses.submit} type="submit" value="Submit" />
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
