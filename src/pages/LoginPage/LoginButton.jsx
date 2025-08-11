import PropTypes from 'prop-types'
import qs from 'qs'

import { eventTracker } from 'services/events/events'
import { useLocationParams } from 'services/navigation/useLocationParams'
import { useNavLinks } from 'services/navigation/useNavLinks'
import { Theme, useThemeContext } from 'shared/ThemeContext'
import {
  loginProviderImage,
  loginProviderToName,
} from 'shared/utils/loginProviders'

function LoginButton({ provider }) {
  const { signIn } = useNavLinks()
  const { theme } = useThemeContext()

  const isDarkMode = theme === Theme.DARK
  const providerName = loginProviderToName(provider)
  const providerImage = loginProviderImage(provider, isDarkMode)

  const { params } = useLocationParams()
  const queryString = qs.stringify({ to: params?.to }, { addQueryPrefix: true })
  const to = `${window.location.protocol}//${window.location.host}/${provider}${queryString}`

  return (
    <a
      className="flex h-14 items-center rounded-sm border border-ds-gray-quaternary bg-ds-gray-primary font-semibold shadow hover:bg-ds-gray-secondary"
      href={signIn.path({ to, provider })}
      data-cy={'login-button'}
      onClick={() => {
        eventTracker().track({
          type: 'Button Clicked',
          properties: {
            buttonName: 'Login',
            buttonLocation: 'Login Page',
            loginProvider: providerName,
          },
        })
      }}
    >
      <img
        alt={`${providerName} logo`}
        className="mx-4 w-6"
        src={providerImage}
      />
      Log in with {providerName}
    </a>
  )
}

LoginButton.propTypes = {
  provider: PropTypes.oneOf(['gh', 'gl', 'bb', 'sentry']).isRequired,
}

export default LoginButton
