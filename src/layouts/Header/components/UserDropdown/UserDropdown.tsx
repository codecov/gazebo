import { useSelect } from 'downshift'
import { useHistory, useParams } from 'react-router-dom'

import config from 'config'

import { useUser } from 'services/user'
import { cn } from 'shared/utils/cn'
import { providerToName } from 'shared/utils/provider'
import Avatar from 'ui/Avatar'
import Button from 'ui/Button'
import Icon from 'ui/Icon'

interface URLParams {
  provider: string
}

type itemProps = {
  to?: toProps
  hook?: string
  onClick?: () => void
}

type toProps = {
  pageName: string
  options?: object
}

function UserDropdown() {
  const { data: currentUser } = useUser({
    options: {
      suspense: false,
    },
  })

  const { provider } = useParams<URLParams>()
  const isGh = providerToName(provider) === 'Github'
  const history = useHistory()

  const items =
    !config.IS_SELF_HOSTED && isGh
      ? [
          {
            props: { to: { pageName: 'codecovAppInstallation' } } as itemProps,
            children: 'Install Codecov app',
          },
        ]
      : []

  const handleSignOut = async () => {
    await fetch(`${config.API_URL}/logout`, {
      method: 'POST',
      credentials: 'include',
    })
    history.replace('/login')
  }

  items.push(
    {
      props: {
        to: {
          pageName: 'account',
          options: { owner: currentUser?.user?.username },
        },
      },
      children: 'Settings',
    },
    {
      props: {
        onClick: handleSignOut,
        hook: 'header-dropdown-sign-out',
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
        className="flex flex-1 items-center gap-1 whitespace-nowrap text-left focus:outline-1"
        data-marketing="user profile menu"
        type="button"
        {...getToggleButtonProps()}
      >
        <Avatar user={currentUser?.user} border="dark" />
        <span
          aria-hidden="true"
          className={cn('transition-transform', {
            'rotate-180': isOpen,
            'rotate-0': !isOpen,
          })}
        >
          <Icon variant="solid" name="chevronDown" size="sm" />
        </span>
      </button>
      <ul
        className={cn(
          'absolute right-0 top-8 z-50 w-[15.5rem] min-w-fit overflow-hidden rounded border border-ds-gray-tertiary bg-white text-gray-900',
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

export default UserDropdown
