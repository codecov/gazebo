import PropTypes from 'prop-types'
import { Redirect, useLocation } from 'react-router-dom'

import { useNavLinks } from 'services/navigation'
import { useFlags } from 'shared/featureFlags'
import {
  LOGIN_PROVIDER_NAMES,
  loginProviderImage,
  loginProviderToName,
} from 'shared/utils/loginProviders'

// temp disabling because of flag
// eslint-disable-next-line max-statements
function LoginButton({ provider }) {
  const { sentryLoginProvider } = useFlags({
    sentryLoginProvider: false,
  })
  const location = useLocation()
  const { signIn } = useNavLinks()

  const to = `${window.location.protocol}//${window.location.host}/${provider}`
  const providerName = loginProviderToName(provider)
  const providerImage = loginProviderImage(provider)

  if (!sentryLoginProvider && providerName === LOGIN_PROVIDER_NAMES.sentry) {
    if (location.pathname === '/login') {
      return null
    }

    return <Redirect to="/login" />
  }

  return (
    <a
      className="flex h-14 items-center rounded-sm border border-ds-gray-quaternary bg-ds-gray-primary font-semibold shadow hover:bg-ds-gray-secondary"
      href={signIn.path({ to, provider })}
      data-cy={'login-button'}
    >
      <img
        alt={`Logo of ${providerName}`}
        className="mx-4 w-6"
        src={providerImage}
      />
      Login with {providerName}
    </a>
  )
}

LoginButton.propTypes = {
  provider: PropTypes.oneOf(['gh', 'gl', 'bb', 'sentry']).isRequired,
}

export default LoginButton
