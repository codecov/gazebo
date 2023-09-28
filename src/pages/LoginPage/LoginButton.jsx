import PropTypes from 'prop-types'

import { useNavLinks } from 'services/navigation'
import {
  loginProviderImage,
  loginProviderToName,
} from 'shared/utils/loginProviders'

function LoginButton({ provider }) {
  const { signIn } = useNavLinks()

  const to = `${window.location.protocol}//${window.location.host}/${provider}`
  const providerName = loginProviderToName(provider)
  const providerImage = loginProviderImage(provider)

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
