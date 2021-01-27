import PropTypes from 'prop-types'
import find from 'lodash/find'
import { Controller } from 'react-hook-form'

import Select from 'ui/Select'
import TextInput from 'ui/TextInput'
import ControlGroup from 'ui/ControlGroup'

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
  search: 'flex-auto px-2 py-4 w-full rounded-tr-md rounded-br-md md:w-auto',
  submit: 'hidden sr:block bg-gray-100 flex-2 px-2 py-3',
  firstFilter: 'rounded-tl-md rounded-bl-md pl-2',
  item: 'flex-1 flex justify-between text-base py-2 truncate',
  itemContent: 'flex justify-between flex-1 text-base truncate',
  icon: 'w-6 h-6 bg-gray-200 rounded-full list-item-type ml-3',
}

export function FormControls({ control, register, onChange, current }) {
  function _renderItem(label, value, target) {
    return (
      <span className={FormClasses.item}>
        <span className={FormClasses.itemContent}>{label}</span>
        {value === current[target] ? (
          <Icon
            className={FormClasses.icon}
            name="check"
            color="text-pink-500"
          />
        ) : (
          <span className={FormClasses.icon}></span>
        )}
      </span>
    )
  }
  return (
    <Card>
      <ControlGroup>
        <Controller
          name="activated"
          control={control}
          render={() => (
            <Select
              className={FormClasses.firstFilter}
              control={control}
              name="activated"
              items={ActivatedItems}
              renderItem={({ label, value }) =>
                _renderItem(label, value, 'activated')
              }
              value={find(
                ActivatedItems,
                ({ value }) => value === current?.activated
              )}
              onChange={({ value }) => {
                onChange({ activated: value })
              }}
            />
          )}
        />
        <Controller
          name="isAdmin"
          control={control}
          render={() => (
            <Select
              control={control}
              items={AdminItems}
              renderItem={({ label, value }) =>
                _renderItem(label, value, 'isAdmin')
              }
              value={find(
                AdminItems,
                ({ value }) => value === current?.isAdmin
              )}
              onChange={({ value }) => {
                onChange({ isAdmin: value })
              }}
            />
          )}
        />
        <Controller
          name="ordering"
          control={control}
          render={() => (
            <Select
              control={control}
              items={OrderingItems}
              renderItem={({ label, value }) =>
                _renderItem(label, value, 'ordering')
              }
              value={find(
                OrderingItems,
                ({ value }) => value === current?.ordering
              )}
              onChange={({ value }, name) => {
                onChange({ ordering: value })
              }}
            />
          )}
        />
        <TextInput
          aria-label="search users"
          className={FormClasses.search}
          name="search"
          ref={register}
          placeholder="Search"
          onChange={(event) => onChange({ search: event.target.value })}
        />
      </ControlGroup>
      {/* Hidden input for screen readers */}
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
