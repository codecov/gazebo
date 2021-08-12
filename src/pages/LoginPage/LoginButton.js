import PropTypes from 'prop-types'

import { providerToName, providerImage } from 'shared/utils/provider'
import { useNavLinks } from 'services/navigation'

const styles = {
  box: 'block h-14 shadow flex items-center font-semibold text-left bg-ds-gray-primary hover:bg-ds-gray-secondary border border-ds-gray-quaternary',
  logo: 'block mx-4 h-6 w-6',
}

function LoginButton({ provider }) {
  const { signIn } = useNavLinks()

  return (
    <a className={styles.box} href={signIn.path({ provider })}>
      <img
        alt={`Logo of ${providerToName(provider)}`}
        className={styles.logo}
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
