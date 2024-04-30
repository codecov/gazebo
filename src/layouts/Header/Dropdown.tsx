import cs from 'classnames'
import { useSelect } from 'downshift'
import { useParams } from 'react-router-dom'

import config from 'config'

import { providerToName } from 'shared/utils/provider'
import Avatar from 'ui/Avatar'
import Button from 'ui/Button'
import Icon from 'ui/Icon'

const LOCAL_STORAGE_SESSION_TRACKING_KEY = 'tracking-session-expiry'

interface URLParams {
  provider: string
}

type CurrentUser = {
  user: {
    avatarUrl: string
    username: string
  }
}

type itemProps = {
  to: toProps
  onClick?: () => void
}

type toProps = {
  pageName: string
  options?: object
}

// TODO: get types for free after converting useUser hook
function Dropdown({ currentUser }: { currentUser: CurrentUser }) {
  const { provider } = useParams<URLParams>()
  const isGh = providerToName(provider) === 'Github'

  const to = `${window.location.protocol}//${window.location.host}/login`

  const items =
    !config.IS_SELF_HOSTED && isGh
      ? [
          {
            props: { to: { pageName: 'codecovAppInstallation' } } as itemProps,
            children: 'Install Codecov app',
          },
        ]
      : []

  const handleSignOut = () => {
    localStorage.removeItem(LOCAL_STORAGE_SESSION_TRACKING_KEY)
  }

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
    {
      props: {
        to: { pageName: 'signOut', options: { to } },
        onClick: handleSignOut,
      },
      children: 'Sign Out',
    }
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
        className="flex flex-1 items-center justify-between whitespace-nowrap text-left focus:outline-1"
        data-marketing="user profile menu"
        type="button"
        {...getToggleButtonProps()}
      >
        <Avatar user={currentUser.user} bordered />
        <span
          aria-hidden="true"
          className={cs('transition-transform', {
            'rotate-180': isOpen,
            'rotate-0': !isOpen,
          })}
        >
          <Icon variant="solid" name="chevronDown" />
        </span>
      </button>
      <ul
        className={cs(
          'z-50 w-[15.5rem] border border-gray-ds-tertiary overflow-hidden rounded bg-white text-gray-900 border-ds-gray-tertiary absolute right-0 top-8 min-w-fit',
          { hidden: !isOpen }
        )}
        aria-label="user profile menu items"
        {...getMenuProps()}
      >
        {isOpen &&
          items.map((item, index) => (
            <li
              key={`main-dropdown-${index}`}
              className="grid cursor-pointer text-sm first:pt-2 last:pb-2 hover:bg-ds-gray-secondary"
              {...getItemProps({ item, index })}
            >
              {/* @ts-expect-error props might be overloaded with stuff */}
              <Button variant="listbox" {...item.props}>
                {item.children}
              </Button>
            </li>
          ))}
      </ul>
    </div>
  )
}

export default Dropdown
