import { Fragment } from 'react'
import AppLink from 'shared/AppLink'

import Dropdown from './Dropdown'
import Button from 'ui/Button'
import { useNavLinks } from 'services/navigation'
import { ReactComponent as CodecovIcon } from 'assets/svg/codecov.svg'
import { useUser } from 'services/user'

const staticLinkClasses = 'ml-8 font-sans font-semibold text-ds-gray-secondary'

export function LoginPrompt() {
  const { provider, signIn } = useNavLinks()
  return (
    <div
      data-testid="login-prompt"
      className="flex items-center justify-between"
    >
      <a href={signIn.path(provider)}>Log in</a>
      <div className="ml-5">
        <Button
          to={{ pageName: 'signUp' }}
          className="ml-4 text-ds-gray-secondary"
          variant={'primary'}
        >
          Sign up
        </Button>
      </div>
    </div>
  )
}

function DesktopMenu() {
  const { data: user } = useUser({
    suspense: false,
  })

  return (
    <>
      <div data-testid="desktop-menu" className="flex items-center">
        <AppLink
          pageName={'provider'}
          tabIndex="0"
          className="mx-2 md:mx-0 flex-shrink-0"
        >
          <span className="sr-only">Link to Homepage</span>
          <CodecovIcon />
        </AppLink>
        <div className="hidden md:block">
          <AppLink pageName={'docs'} className={staticLinkClasses}>
            Docs
          </AppLink>
          <AppLink pageName={'support'} className={staticLinkClasses}>
            Support
          </AppLink>
          <AppLink pageName={'blog'} className={staticLinkClasses}>
            Blog
          </AppLink>
        </div>
      </div>
      {!!user ? <Dropdown user={user} /> : <LoginPrompt />}
    </>
  )
}

export default DesktopMenu
