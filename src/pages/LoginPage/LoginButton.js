import PropTypes from 'prop-types'

import Icon from 'ui/Icon'
import { Menu, MenuList, MenuButton, MenuLink } from '@reach/menu-button'
import '@reach/menu-button/styles.css'
import { providerToName, providerImage } from 'shared/utils/provider'
import { useNavLinks } from 'services/navigation'

const styles = {
  box: 'h-14 shadow flex items-center text-left bg-ds-gray-primary border border-ds-gray-quaternary rounded-sm',
  link: 'h-full flex-grow flex items-center font-semibold hover:bg-ds-gray-secondary',
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
      >
        <img
          alt={`Logo of ${providerToName(provider)}`}
          className={styles.logo}
          src={providerImage(provider)}
        />
        Login with {providerToName(provider)}
      </a>
      {provider === 'gh' && (
        <Menu id="scope-dropdown">
          <MenuButton className={styles.dropdownGithub}>
            <Icon name="chevron-down" />
          </MenuButton>
          <MenuList className={styles.dropdownList}>
            <MenuLink
              className={styles.dropdownLink}
              href={signIn.path({ to, provider, privateScope: true })}
            >
              All repos
            </MenuLink>
            <MenuLink
              className={styles.dropdownLink}
              href={signIn.path({ to, provider })}
            >
              Public repos only
            </MenuLink>
          </MenuList>
        </Menu>
      )}
    </div>
  )
}

LoginButton.propTypes = {
  provider: PropTypes.oneOf(['gh', 'gl', 'bb']).isRequired,
}

export default LoginButton
