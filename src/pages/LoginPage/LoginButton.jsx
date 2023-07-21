import PropTypes from 'prop-types'

import { useNavLinks } from 'services/navigation'
import { providerImage, providerToName } from 'shared/utils/provider'

function LoginButton({ provider }) {
  const { signIn } = useNavLinks()
  const to = `${window.location.protocol}//${window.location.host}/${provider}`

  return (
    <a
      className="flex h-14 items-center rounded-sm border border-ds-gray-quaternary bg-ds-gray-primary font-semibold shadow hover:bg-ds-gray-secondary"
      href={signIn.path({ to, provider })}
      data-cy={'login-button'}
    >
      <img
        alt={`Logo of ${providerToName(provider)}`}
        className="mx-4 w-6"
        src={providerImage(provider)}
      />
      Login with {providerToName(provider)}
    </a>
  )
}

LoginButton.propTypes = {
  provider: PropTypes.oneOf(['gh', 'gl', 'bb']).isRequired,
}

export default LoginButton
