import cs from 'classnames'
import { useSelect } from 'downshift'
import PropTypes from 'prop-types'
import { useParams } from 'react-router-dom'

import config from 'config'

import { providerToName } from 'shared/utils/provider'
import A from 'ui/A'
import Avatar from 'ui/Avatar'
import Icon from 'ui/Icon'

function Dropdown({ currentUser }) {
  const { provider } = useParams()
  const isGh = providerToName(provider) === 'Github'

  const items =
    !config.IS_SELF_HOSTED && isGh
      ? [
          {
            props: { to: { pageName: 'userAppManagePage' } },
            children: 'Manage GitHub org access',
          },
        ]
      : []

  items.push(
    {
      props: {
        to: {
          pageName: 'account',
          options: { owner: currentUser.user.username },
        },
      },
      children: 'Settings',
    },
    { props: { to: { pageName: 'provider' } }, children: 'Organizations' },
    { props: { to: { pageName: 'signOut' } }, children: 'Sign Out' }
  )

  const {
    isOpen,
    getToggleButtonProps,
    getItemProps,
    getLabelProps,
    getMenuProps,
  } = useSelect({
    items,
  })

  return (
    <div
      className="relative"
      data-testid="dropdown"
      data-cy="auth-user-dropdown"
    >
      <label className="sr-only" {...getLabelProps()}>
        Logged in user sub navigation
      </label>
      <button
        className="flex justify-between items-center flex-1 text-left whitespace-nowrap focus:outline-1"
        data-marketing="user profile menu"
        type="button"
        {...getToggleButtonProps()}
      >
        <Avatar user={currentUser.user} bordered />
        <Icon variant="solid" name={isOpen ? 'chevron-up' : 'chevron-down'} />
      </button>
      <ul
        className={cs(
          'z-50 w-[15rem] border border-gray-ds-tertiary overflow-hidden rounded bg-white text-black border-ds-gray-tertiary absolute right-0 top-8 min-w-fit',
          { hidden: !isOpen }
        )}
        aria-label="user profile menu items"
        {...getMenuProps()}
      >
        {isOpen &&
          items.map((item, index) => (
            <li
              key={`main-dropdown-${index}`}
              className="block cursor-pointer py-2 px-3 text-sm font-normal"
              {...getItemProps({ item, index })}
            >
              <A {...item.props}>{item.children}</A>
            </li>
          ))}
      </ul>
    </div>
  )
}

Dropdown.propTypes = {
  currentUser: PropTypes.shape({
    user: PropTypes.shape({
      avatarUrl: PropTypes.string.isRequired,
      username: PropTypes.string.isRequired,
    }).isRequired,
  }),
}

export default Dropdown
