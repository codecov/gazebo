import cs from 'classnames'
import { useCombobox } from 'downshift'
import PropTypes from 'prop-types'
import { useRef, useState } from 'react'
import useClickAway from 'react-use/lib/useClickAway'

import TextInput from 'old_ui/TextInput'
import User from 'old_ui/User'
import { ApiFilterEnum } from 'services/navigation'
import { useUsers } from 'services/users'
import { getOwnerImg } from 'shared/utils'

const styles = {
  listResult: (isOpen) =>
    cs(
      'overflow-hidden rounded-b-md bg-gray-100 border border-gray-200 outline-none absolute w-full z-10 ',
      { hidden: !isOpen }
    ),
  item: (highlighted) =>
    cs('flex p-2 text-sm border-t border-gray-200', {
      'bg-white': highlighted,
    }),
  input: (isOpen) => cs({ 'rounded-b-none': isOpen, 'rounded-t-3xl': isOpen }),
}

function ResultList({
  isLoading,
  users,
  getItemProps,
  highlightedIndex,
  provider,
}) {
  if (isLoading) return 'loading...'

  if (users.length === 0) return 'No users found'

  return users.map((user, index) => (
    <li
      className={cs(styles.item(highlightedIndex === index), 'cursor-pointer')}
      key={user.username}
      {...getItemProps({ item: user, index })}
    >
      <User
        avatarUrl={getOwnerImg(provider, user.username)}
        name={user.name}
        username={user.username}
        pills={[user.email]}
        compact
      />
    </li>
  ))
}

function useSearch({ provider, owner, setAdminStatus }) {
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
      staleTime: 0,
      keepPreviousData: false,
    },
  })

  const users = data?.results ?? []

  const {
    getMenuProps,
    getInputProps,

    getItemProps,
    highlightedIndex,
  } = useCombobox({
    items: users,
    inputValue: input,
    stateReducer: (state, actionAndChanges) => {
      // when a result is selected, reset input and selectedItem and call
      // the setAdminStatus callback from the props
      const { type, changes } = actionAndChanges
      switch (type) {
        case useCombobox.stateChangeTypes.InputKeyDownEnter:
        case useCombobox.stateChangeTypes.ItemClick:
          setInput('')
          setAdminStatus(changes.selectedItem, true)
          return {
            ...changes,
            selectedItem: null,
            inputValue: '',
          }
        default:
          return changes
      }
    },
    onInputValueChange: ({ inputValue }) => setInput(inputValue),
    isOpen,
  })

  return {
    highlightedIndex,
    isOpen,
    users,
    setInput,
    getInputProps,
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
    getMenuProps,
    getItemProps,
    isLoading,
    highlightedIndex,
  } = useSearch({ provider, owner, setAdminStatus })
  const wrapperRef = useRef()
  useClickAway(wrapperRef, () => setInput(''))

  return (
    <div className="relative" ref={wrapperRef}>
      <div>
        <TextInput
          dataMarketing="add-admin"
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
            getItemProps={getItemProps}
            provider={provider}
            highlightedIndex={highlightedIndex}
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
