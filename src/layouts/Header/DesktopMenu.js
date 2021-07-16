import Dropdown from './Dropdown'
import Button from 'ui/Button'
import PropTypes from 'prop-types'
import A from 'ui/A'
import { ReactComponent as CodecovIcon } from 'assets/svg/codecov.svg'
import { useUser } from 'services/user'
import { useParams } from 'react-router-dom'
import { useAccountDetails } from 'services/account'
import { Suspense } from 'react'

export function LoginPrompt() {
  return (
    <div
      data-testid="login-prompt"
      className="flex items-center justify-between mx-2 md:mx-0 gap-4"
    >
      <A to={{ pageName: 'signIn' }} variant="header">
        Log in
      </A>
      <Button to={{ pageName: 'signUp' }} variant="primary">
        Sign up
      </Button>
    </div>
  )
}

export function RequestButton({ owner, provider }) {
  const { data: accountDetails } = useAccountDetails({ provider, owner })
  return (
    accountDetails.plan.value === 'users-free' && (
      <div className="mr-5">
        <Button
          to={{ pageName: 'demo' }}
          variant="secondary"
          data-testid="request-demo"
        >
          Request demo
        </Button>
      </div>
    )
  )
}

RequestButton.propTypes = {
  owner: PropTypes.string.isRequired,
  provider: PropTypes.string.isRequired,
}

function DesktopMenu() {
  const { data: user } = useUser({
    suspense: false,
  })
  const { owner, provider } = useParams()

  return (
    <>
      <div data-testid="desktop-menu" className="flex items-center gap-4">
        <A to={{ pageName: 'provider' }}>
          <span className="sr-only">Link to Homepage</span>
          <CodecovIcon />
        </A>
        <A to={{ pageName: 'docs' }} variant="header">
          Docs
        </A>
        <A to={{ pageName: 'support' }} variant="header">
          Support
        </A>
        <A to={{ pageName: 'blog' }} variant="header">
          Blog
        </A>
      </div>
      {!!user ? (
        <div className="flex items-center space-between mx-2 md:mx-4">
          {!!owner && (
            <Suspense fallback={null}>
              <RequestButton owner={owner} provider={provider} />
            </Suspense>
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
