import React, { useRef, useState } from 'react'
import { useClickAway } from 'react-use'
import cs from 'classnames'
import { useParams } from 'react-router-dom'
import { useSubNav } from 'services/header'
import { useUser } from 'services/user'
import { useNavLinks } from 'services/navigation'
import Icon from 'old_ui/Icon'
import { ReactComponent as SignInIcon } from 'assets/svg/signIn.svg'

import Button from 'old_ui/Button'
import { UserNavLink } from './NavLink'
import Avatar from 'old_ui/Avatar'

function Dropdown() {
  const { signIn } = useNavLinks()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef()
  const { data: user } = useUser({
    suspense: false,
  })
  const subMenu = useSubNav()
  const { provider } = useParams()
  const avatarUrl =
    provider !== 'bb' && provider !== 'bitbucket' ? user?.avatarUrl : null

  useClickAway(dropdownRef, () => setIsOpen(false))
  if (!user)
    return (
      <Button
        to={signIn.path()}
        useRouter={!signIn.isExternalLink}
        className="flex items-center ml-4"
      >
        <SignInIcon className="mr-2" />
        {signIn.text}
      </Button>
    )

  return (
    <div
      ref={dropdownRef}
      className="ml-3 relative w-44 border border-solid border-gray-900"
    >
      <button
        tabIndex="0"
        onClick={() => setIsOpen(!isOpen)}
        className={cs(
          'flex w-full justify-between items-center p-2 text-sm rounded-t-3xl',
          'border-r border-l border-t border-solid border-gray-900',
          'bg-gray-800 hover:bg-gray-600 focus:outline-none',
          { 'rounded-b-3xl': !isOpen, 'rounded-b-none': isOpen }
        )}
        id="user-menu"
        aria-haspopup="true"
      >
        <span className="sr-only">Open user menu</span>
        <div className="flex items-center">
          <Avatar
            className="h-7 w-7 rounded-full"
            username={user.username}
            avatarUrl={avatarUrl}
          />
          <p className="mx-2">{user.username}</p>
        </div>
        <Icon
          name="rightChevron"
          color="text-white"
          iconClass="w-5 h-5 fill-current"
          className={cs(
            'mr-2',
            'transition-transform duration-75 ease-in-out transform',
            'motion-reduce:transition-none motion-reduce:transform-none',
            {
              '-rotate-90': isOpen,
              'rotate-90': !isOpen,
            }
          )}
        />
      </button>
      <div
        className={cs(
          'origin-top-right absolute right-0',
          'bg-gray-800 w-full rounded-b-3xl',
          'border-r border-l border-b border-solid border-gray-900',
          'divide-y divide-gray-900',
          { hidden: !isOpen }
        )}
        role="menu"
        aria-orientation="vertical"
        aria-labelledby="user-menu"
      >
        {subMenu.map((props, i) => (
          <UserNavLink
            onClick={() => setIsOpen(false)}
            key={`dropdown-${i}`}
            className={cs(
              'bg-gray-800 hover:bg-gray-600',
              'first:border-t first:border-solid first:border-gray-900',
              'last:rounded-b-3xl last:pb-3 px-4'
            )}
            {...props}
          />
        ))}
      </div>
    </div>
  )
}

export default Dropdown
