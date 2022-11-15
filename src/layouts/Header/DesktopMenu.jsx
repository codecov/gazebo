import { useLocation, useParams } from 'react-router-dom'

import config from 'config'

import { ReactComponent as CodecovIcon } from 'assets/svg/codecov.svg'
import { useUser } from 'services/user'
import A from 'ui/A'
import Button from 'ui/Button'

import AdminLink from './AdminLink'
import Dropdown from './Dropdown'
import FeedbackLink from './FeedbackLink'
import RequestButton from './RequestButton'
import SeatDetails from './SeatDetails'

export function LoginPrompt() {
  const { provider } = useParams()

  const to = window.location.href
  const { pathname } = useLocation()

  if (!provider) return null

  // different page if login
  if (pathname.startsWith('/login')) {
    return (
      <div className="text-ds-gray-tertiary">
        New to Codecov?{' '}
        <A to={{ pageName: 'root' }} variant="header">
          Learn more
        </A>
      </div>
    )
  }
  return (
    <div
      data-testid="login-prompt"
      className="flex items-center justify-between mx-2 md:mx-0 gap-4"
    >
      <A to={{ pageName: 'signIn', options: { to } }} variant="header">
        Log in
      </A>
      <Button to={{ pageName: 'signUp' }} variant="primary">
        Sign up
      </Button>
    </div>
  )
}

function DesktopMenu() {
  const { data: currentUser } = useUser({
    suspense: false,
  })
  const { owner, provider } = useParams()

  return (
    <>
      <div data-testid="desktop-menu" className="flex items-center gap-4">
        <A to={{ pageName: 'provider' }} variant="header">
          <span className="sr-only">Link to Homepage</span>
          <CodecovIcon />
        </A>
        <A to={{ pageName: 'docs' }} variant="header" showExternalIcon={false}>
          Docs
        </A>
        <A
          to={{ pageName: 'support' }}
          variant="header"
          showExternalIcon={false}
        >
          Support
        </A>
        <A to={{ pageName: 'blog' }} variant="header" showExternalIcon={false}>
          Blog
        </A>
        {!!currentUser && <FeedbackLink />}
      </div>
      {!!currentUser ? (
        <div className="flex items-center space-between mx-2 md:mx-4 gap-4">
          {config.IS_SELF_HOSTED && (
            <>
              <SeatDetails />
              <AdminLink />
            </>
          )}
          {!!owner && <RequestButton owner={owner} provider={provider} />}
          <Dropdown currentUser={currentUser} />
        </div>
      ) : (
        <LoginPrompt />
      )}
    </>
  )
}

export default DesktopMenu
