import PropTypes from 'prop-types'

import { useNavLinks } from 'services/navigation'
import { providerImage, providerToName } from 'shared/utils/provider'
import Icon from 'ui/Icon'

const styles = {
  box: 'h-14 shadow flex items-center text-left bg-ds-gray-primary border border-ds-gray-quaternary rounded-sm',
  link: 'h-full grow flex items-center font-semibold hover:bg-ds-gray-secondary',
  dropdownGithub:
    'flex justify-center items-center h-full w-12 border-l border-ds-gray-quaternary hover:bg-ds-gray-secondary',
  logo: 'block mx-4 h-6 w-6',
  dropdownList:
    'bg-ds-gray-primary mt-1 border border-ds-gray-quaternary rounded-sm py-2',
  dropdownLink: 'hover:text-ds-gray-octonary hover:bg-ds-gray-secondary',
}

function LoginButton({ provider }) {
  const { signIn } = useNavLinks()
  const to = `${window.location.protocol}//${window.location.host}/${provider}`

  return (
    <div className={styles.box}>
      <a
        className={styles.link}
        href={signIn.path({ to, provider, privateScope: true })}
        data-cy={'login-button'}
      >
        <img
          alt={`Logo of ${providerToName(provider)}`}
          className={styles.logo}
          src={providerImage(provider)}
        />
        Login with {providerToName(provider)}
      </a>
      {provider === 'gh' && (
        <div id="scope-dropdown">
          <button className={styles.dropdownGithub}>
            <Icon name="chevron-down" />
          </button>
          <ul className={styles.dropdownList}>
            <li
              className={styles.dropdownLink}
              href={signIn.path({ to, provider, privateScope: true })}
            >
              All repos
            </li>
            <li
              className={styles.dropdownLink}
              href={signIn.path({ to, provider })}
            >
              Public repos only
            </li>
          </ul>
        </div>
      )}
    </div>
  )
}

LoginButton.propTypes = {
  provider: PropTypes.oneOf(['gh', 'gl', 'bb']).isRequired,
}

export default LoginButton
