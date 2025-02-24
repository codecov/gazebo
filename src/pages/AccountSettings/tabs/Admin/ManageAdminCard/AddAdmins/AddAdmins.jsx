import cs from 'classnames'
import { useCombobox } from 'downshift'
import PropTypes from 'prop-types'
import { useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useDebounce } from 'react-use'
import useClickAway from 'react-use/lib/useClickAway'

import User from 'old_ui/User'
import { ApiFilterEnum } from 'services/navigation/normalize'
import { useUsers } from 'services/users'
import { getOwnerImg } from 'shared/utils/ownerHelpers'
import TextInput from 'ui/TextInput'

const styles = {
  listResult: (isOpen) =>
    cs(
      'overflow-hidden rounded-b-md bg-ds-container border border-ds-gray-secondary outline-none absolute z-10 ',
      { hidden: !isOpen }
    ),
  item: (highlighted) =>
    cs('flex p-2 text-sm border-t border-ds-gray-secondary', {
      'bg-ds-gray-primary': highlighted,
    }),
  input: (isOpen) => cs({ 'rounded-b-none': isOpen }),
}

function ResultList({ isLoading, users, getItemProps, highlightedIndex }) {
  const { provider } = useParams()

  if (isLoading) {
    return <p className="px-1 py-2">Loading...</p>
  }

  if (users.length === 0) {
    return <p className="px-1 py-2">No users found</p>
  }

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

ResultList.propTypes = {
  isLoading: PropTypes.bool,
  users: PropTypes.array,
  getItemProps: PropTypes.func,
  highlightedIndex: PropTypes.number,
}

function useSearch({ setAdminStatus }) {
  const { provider, owner } = useParams()
  const [input, setInput] = useState('')
  const [search, setSearch] = useState('')

  useDebounce(
    () => {
      setSearch(input)
    },
    500,
    [input]
  )

  const params = { isAdmin: ApiFilterEnum.false, search: search }
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

  const { getMenuProps, getInputProps, getItemProps, highlightedIndex } =
    useCombobox({
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

function AddAdmins({ setAdminStatus }) {
  const {
    isOpen,
    setInput,
    users,
    getInputProps,
    getMenuProps,
    getItemProps,
    isLoading,
    highlightedIndex,
  } = useSearch({ setAdminStatus })
  const wrapperRef = useRef()
  useClickAway(wrapperRef, () => setInput(''))

  return (
    <div className="relative w-4/12" ref={wrapperRef}>
      <div>
        <TextInput
          dataMarketing="add-admin"
          placeholder="Search to add administrator"
          className={cs(styles.input(isOpen))}
          {...getInputProps()}
        />
      </div>
      <ul
        {...getMenuProps()}
        className={cs(styles.listResult(isOpen), 'w-full')}
      >
        {isOpen && (
          <ResultList
            users={users}
            isLoading={isLoading}
            getItemProps={getItemProps}
            highlightedIndex={highlightedIndex}
          />
        )}
      </ul>
    </div>
  )
}

AddAdmins.propTypes = {
  setAdminStatus: PropTypes.func.isRequired,
}

export default AddAdmins
