import PropTypes from 'prop-types'
import { Controller, useForm } from 'react-hook-form'

import Select from 'ui/Select'
import TextInput from 'ui/TextInput'
import ControlGroup from 'ui/ControlGroup'

import { ApiFilterEnum } from 'services/navigation'

import Card from 'ui/Card'
import Icon from 'ui/Icon'

const OrderingItems = [
  { label: 'Name A-Z', value: 'name' },
  { label: 'Name Z-A', value: '-name' },
  { label: 'Username A-Z', value: 'username' },
  { label: 'Username Z-A', value: '-username' },
  { label: 'Email A-Z', value: 'email' },
  { label: 'Email Z-A', value: '-email' },
]

const AdminItems = [
  { label: 'Everyone', value: ApiFilterEnum.none },
  { label: 'Admins', value: ApiFilterEnum.true },
  { label: 'Collaborators', value: ApiFilterEnum.false },
]

const ActivatedItems = [
  { label: 'All users', value: ApiFilterEnum.none },
  { label: 'Active users', value: ApiFilterEnum.true },
  { label: 'In-active users', value: ApiFilterEnum.false },
]

const FormClasses = {
  search:
    'flex-none md:flex-1 w-full border-t md:border-t-0 border-solid border-gray-200 py-2',
  submit: 'hidden sr:block bg-gray-100 flex-2 px-2 py-3',
  firstFilter: 'flex-1 rounded-tl-md rounded-bl-md',
  filter: 'flex-1',
  item: 'flex justify-between text-base py-2 truncate',
  itemContent: 'flex justify-between text-base truncate',
  icon: 'w-6 h-6 bg-gray-100 rounded-full list-item-type ml-3',
}

function SelectedItem({ label }) {
  return (
    <span className={FormClasses.item}>
      <span className={FormClasses.itemContent}>{label}</span>
    </span>
  )
}
SelectedItem.propTypes = {
  label: PropTypes.string.isRequired,
}

function Item({ label }, { isSelected }) {
  return (
    <span className={FormClasses.item}>
      <span className={FormClasses.itemContent}>{label}</span>
      {isSelected ? (
        <Icon className={FormClasses.icon} name="check" color="text-pink-500" />
      ) : (
        <span className={FormClasses.icon}></span>
      )}
    </span>
  )
}

Item.propTypes = {
  label: PropTypes.string.isRequired,
}

export function FormControls({ onChange, current, defaultValues }) {
  const { register, control } = useForm({
    defaultValues,
  })

  return (
    <form onSubmit={onChange}>
      <Card>
        <ControlGroup>
          <Controller
            name="activated"
            control={control}
            render={() => (
              <Select
                ariaName="activated"
                className={FormClasses.firstFilter}
                control={control}
                items={ActivatedItems}
                renderSelected={SelectedItem}
                renderItem={Item}
                value={ActivatedItems.find(
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
                ariaName="isAdmin"
                className={FormClasses.filter}
                control={control}
                items={AdminItems}
                renderSelected={SelectedItem}
                renderItem={Item}
                value={ActivatedItems.find(
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
                ariaName="ordering"
                className={FormClasses.filter}
                control={control}
                items={OrderingItems}
                renderSelected={SelectedItem}
                renderItem={Item}
                value={OrderingItems.find(
                  ({ value }) => value === current?.ordering
                )}
                onChange={({ value }) => {
                  onChange({ ordering: value })
                }}
              />
            )}
          />
          <TextInput
            variant="light"
            aria-label="search users"
            className={FormClasses.search}
            name="search"
            ref={register}
            placeholder="Search"
            embedded={() => <Icon name="search" className="absolute top-2" />}
            onChange={(event) => onChange({ search: event.target.value })}
          />
        </ControlGroup>
        {/* Hidden input for screen readers */}
        <input className={FormClasses.submit} type="submit" value="Submit" />
      </Card>
    </form>
  )
}

FormControls.propTypes = {
  onChange: PropTypes.func.isRequired,
  defaultValues: PropTypes.object.isRequired,
  current: PropTypes.object.isRequired,
}
