
import PropTypes from 'prop-types'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'

import Card from 'old_ui/Card'
import ControlGroup from 'old_ui/ControlGroup'
import Icon from 'old_ui/Icon'
import Select from 'old_ui/Select'
import TextInput from 'old_ui/TextInput'
import { ApiFilterEnum } from 'services/navigation'

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
    'flex-none md:w-1/2 w-full border-t md:border-t-0 border-solid border-gray-200 py-2',
  submit: 'hidden sr:block bg-gray-100 flex-2 px-2 py-3',
  firstFilter: 'flex-1 md:w-1/4 rounded-tl-md rounded-bl-md',
  filter: 'flex-1 md:w-1/4',
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

  const [searchText, setSearchText] = useState('')

  function handleInput(event) {
    const value = event?.target?.value
    setSearchText(value)
    onChange({ search: value })
  }

  function handleSubmit(event) {
    event.preventDefault()
    onChange({ search: searchText })
  }

  return (
    <form onSubmit={handleSubmit}>
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
                value={AdminItems.find(
                  ({ value }) => value === current?.isAdmin
                )}
                onChange={({ value }) => {
                  onChange({ isAdmin: value })
                }}
              />
            )}
          />
          <TextInput
            variant="light"
            aria-label="search users"
            className={FormClasses.search}
            name="search"
            {...register('search')}
            placeholder="Search"
            embedded={() => (
              <Icon
                iconClass="w-4 h-4 fill-current"
                name="search"
                size="sm"
                className="absolute top-2"
              />
            )}
            onChange={handleInput}
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
