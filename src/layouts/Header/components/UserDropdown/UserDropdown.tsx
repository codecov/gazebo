import { useHistory, useParams } from 'react-router-dom'

import config from 'config'

import { eventTracker } from 'services/events/events'
import { useUser } from 'services/user'
import { Provider } from 'shared/api/helpers'
import { providerToName } from 'shared/utils/provider'
import Avatar from 'ui/Avatar'
import Button from 'ui/Button'
import { Dropdown } from 'ui/Dropdown/Dropdown'

interface URLParams {
  provider: Provider
}

type DropdownItem = {
  to?: toProps
  hook?: string
  onClick?: () => void
  children: React.ReactNode
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
  const isGh = providerToName(provider) === 'GitHub'
  const history = useHistory()

  const items =
    !config.IS_SELF_HOSTED && isGh
      ? [
          {
            to: { pageName: 'codecovAppInstallation' },
            children: 'Install Codecov app',
            onClick: () =>
              eventTracker().track({
                type: 'Button Clicked',
                properties: {
                  buttonName: 'Install GitHub App',
                  buttonLocation: 'User dropdown',
                },
              }),
          } as DropdownItem,
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
      to: {
        pageName: 'account',
        options: { owner: currentUser?.user?.username },
      },
      children: 'Settings',
    },
    {
      onClick: handleSignOut,
      hook: 'header-dropdown-sign-out',
      children: 'Sign Out',
    }
  )

  return (
    <div
      className="relative"
      data-testid="user-dropdown"
      data-cy="auth-user-dropdown"
    >
      <label className="sr-only">Logged in user sub navigation</label>

      <Dropdown>
        <Dropdown.Trigger
          data-marketing="user profile menu"
          data-testid="user-dropdown-trigger"
        >
          <Avatar
            user={currentUser?.user}
            border="dark"
            className="select-none"
          />
        </Dropdown.Trigger>

        <Dropdown.Content
          align="end"
          className="w-[15.5rem] min-w-fit rounded border-ds-gray-tertiary shadow-none"
          aria-label="user profile menu items"
        >
          {items.map((item, index) => (
            <Dropdown.Item
              key={`main-dropdown-${index}`}
              className="grid p-0 first:pt-2 last:pb-2"
            >
              {/* @ts-expect-error props might be overloaded with stuff */}
              <Button variant="listbox" {...item} />
            </Dropdown.Item>
          ))}
        </Dropdown.Content>
      </Dropdown>
    </div>
  )
}

export default UserDropdown
