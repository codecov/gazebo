import { Fragment } from 'react'
import AppLink from 'shared/AppLink'

import Dropdown from './Dropdown'
import Button from 'ui/Button'
import { useNavLinks } from 'services/navigation'
import { ReactComponent as CodecovIcon } from 'assets/svg/codecov.svg'
import { useUser } from 'services/user'

const staticLinkClasses = 'ml-7 font-sans font-semibold text-ds-gray-secondary'

export function LoginPrompt() {
  const { provider, signIn } = useNavLinks()
  return (
    <div
      data-testid="login-prompt"
      className="flex items-center justify-between mx-2 md:mx-0"
    >
      <a href={signIn.path(provider)}>Log in</a>
      <div className="ml-7">
        <Button
          to={{ pageName: 'signUp' }}
          className="text-ds-gray-secondary"
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
      {!!user ? (
        <div className="flex items-center space-between mx-2 md:mx-4">
          {user.plan === 'users-free' && (
            <div className="mr-5">
              <Button
                //TODO: figure page this needs to be linked to
                to={{ pageName: 'signUp' }}
                variant={'primary'}
              >
                Request demo
              </Button>
            </div>
          )}
          <Dropdown user={user} />
        </div>
      ) : (
        <LoginPrompt />
      )}
    </>
  )
}

export default DesktopMenu
