import config from 'config'

import { CodecovIcon } from 'assets/svg/codecov'
import { useUser } from 'services/user'
import A from 'ui/A'
import Button from 'ui/Button'

import AdminLink from './AdminLink'
import Dropdown from './Dropdown'
import SeatDetails from './SeatDetails'

export function LoginPrompt() {
  const to = window.location.href
  return (
    <div
      data-testid="login-prompt"
      className="mx-2 flex items-center justify-between gap-4 md:mx-0"
    >
      <A
        to={{ pageName: 'signIn', options: { to } }}
        variant="header"
        isExternal={false}
        hook="desktop-menu-login-link"
      >
        Log in
      </A>
      <Button
        to={{ pageName: 'signUp' }}
        variant="primary"
        disabled={false}
        hook="desktop-menu-login-button"
      >
        Sign up
      </Button>
    </div>
  )
}

export const LogoButton = ({
  defaultOrg,
  fillColor,
}: {
  defaultOrg?: string
  fillColor?: string
}) => {
  let pageName = 'root'
  if (defaultOrg) {
    pageName = 'owner'
  }

  return (
    <A
      to={{
        pageName: pageName,
        options: { owner: defaultOrg },
      }}
      variant="header"
      data-testid="homepage-link"
      isExternal={pageName === 'root' ? true : false}
      hook="desktop-menu-homepage-link"
    >
      <span className="sr-only">Link to Homepage</span>
      <CodecovIcon fillColor={fillColor} />
    </A>
  )
}

function DesktopMenu() {
  const { data: currentUser } = useUser({
    options: {
      suspense: false,
    },
  })
  const defaultOrg =
    currentUser?.owner?.defaultOrgUsername ?? currentUser?.user?.username

  return (
    <>
      <div data-testid="desktop-menu" className="flex items-center gap-4">
        <LogoButton defaultOrg={defaultOrg} />
        <A
          to={{ pageName: 'docs' }}
          variant="header"
          isExternal={false}
          showExternalIcon={false}
          hook="desktop-menu-docs-link"
        >
          Docs
        </A>
        <A
          to={{ pageName: 'support' }}
          variant="header"
          isExternal={false}
          showExternalIcon={false}
          hook="desktop-menu-support-link"
        >
          Support
        </A>
        <A
          to={{ pageName: 'blog' }}
          variant="header"
          isExternal={false}
          showExternalIcon={false}
          hook="desktop-menu-blog-link"
        >
          Blog
        </A>
      </div>
      {!!currentUser ? (
        <div className="mx-2 flex items-center gap-4 md:mx-4">
          {config.IS_SELF_HOSTED && (
            <>
              <SeatDetails />
              <AdminLink />
            </>
          )}
          <Dropdown currentUser={currentUser} />
        </div>
      ) : (
        <LoginPrompt />
      )}
    </>
  )
}

export default DesktopMenu
