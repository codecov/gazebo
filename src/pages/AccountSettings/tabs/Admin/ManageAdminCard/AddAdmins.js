import PropTypes from 'prop-types'
import cs from 'classnames'
import { useState, useRef } from 'react'
import { useCombobox } from 'downshift'
import useClickAway from 'react-use/lib/useClickAway'

import { ApiFilterEnum } from 'services/navigation'
import { useUsers } from 'services/users'
import TextInput from 'ui/TextInput'
import Button from 'ui/Button'

function stateReducer(state, actionAndChanges) {
  const { type, changes } = actionAndChanges
  const actionToState = {
    [useCombobox.stateChangeTypes.InputKeyDownEnter]: state,
    [useCombobox.stateChangeTypes.ItemClick]: state,
  }

  return actionToState[type] ?? changes
}

const styles = {
  listResult: (isOpen) =>
    cs(
      'overflow-hidden rounded-b-md bg-gray-100 border border-gray-200 outline-none absolute w-full z-10 shadow-card',
      { hidden: !isOpen }
    ),
  item: 'block p-2 text-sm border-t border-gray-200',
  input: (isOpen) => cs({ 'rounded-b-none': isOpen, 'rounded-t-3xl': isOpen }),
}

function ResultList({
  isLoading,
  users,
  setInput,
  getItemProps,
  setAdminStatus,
}) {
  if (isLoading) return 'loading...'

  if (users.length === 0) return 'No users found'

  return users.map((user, index) => (
    <li
      className={styles.item}
      key={user.username}
      {...getItemProps({ item: user, index })}
    >
      {user.username}
      <Button
        onClick={() => {
          setInput('')
          setAdminStatus(user, true)
        }}
      >
        +
      </Button>
    </li>
  ))
}

function useSearch({ provider, owner }) {
  const [input, setInput] = useState('')
  const params = { isAdmin: ApiFilterEnum.false, search: input }
  const isOpen = input.length > 0
  const { data, isLoading } = useUsers({
    provider,
    owner,
    query: params,
    opts: {
      suspense: false,
      enabled: isOpen,
    },
  })

  const users = data?.results ?? []

  const {
    getMenuProps,
    getInputProps,
    getComboboxProps,
    getItemProps,
  } = useCombobox({
    items: users,
    stateReducer,
    inputValue: input,
    onInputValueChange: ({ inputValue }) => setInput(inputValue),
    isOpen,
  })

  return {
    isOpen,
    users,
    setInput,
    getInputProps,
    getComboboxProps,
    getMenuProps,
    getItemProps,
    isLoading,
  }
}

function AddAdmins({ provider, owner, setAdminStatus }) {
  const {
    isOpen,
    setInput,
    users,
    getInputProps,
    getComboboxProps,
    getMenuProps,
    getItemProps,
    isLoading,
  } = useSearch({ provider, owner })
  const wrapperRef = useRef()
  useClickAway(wrapperRef, () => setInput(''))

  return (
    <div className="relative" ref={wrapperRef}>
      <div {...getComboboxProps()}>
        <TextInput
          placeholder="Search to add administrator"
          className={styles.input(isOpen)}
          {...getInputProps()}
        />
      </div>
      <ul {...getMenuProps()} className={styles.listResult(isOpen)}>
        {isOpen && (
          <ResultList
            users={users}
            isLoading={isLoading}
            setInput={setInput}
            getItemProps={getItemProps}
            setAdminStatus={setAdminStatus}
          />
        )}
      </ul>
    </div>
  )
}

AddAdmins.propTypes = {
  provider: PropTypes.string.isRequired,
  owner: PropTypes.string.isRequired,
  setAdminStatus: PropTypes.func.isRequired,
}

export default AddAdmins
