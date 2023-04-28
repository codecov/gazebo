import cs from 'classnames'
import PropTypes from 'prop-types'
import { useRef, useState } from 'react'
import useClickAway from 'react-use/lib/useClickAway'

import { useNavLinks } from 'services/navigation'
import { providerImage, providerToName } from 'shared/utils/provider'
import Icon from 'ui/Icon'

function useCloseOnLooseFocus({ setToggle }) {
  const ref = useRef(null)
  useClickAway(ref, () => setToggle((toggle) => (!toggle ? toggle : false)))

  return ref
}

function LoginButton({ provider }) {
  const [toggle, setToggle] = useState(false)
  const { signIn } = useNavLinks()
  const to = `${window.location.protocol}//${window.location.host}/${provider}`

  const ref = useCloseOnLooseFocus({ setToggle })

  return (
    <div
      ref={ref}
      className="flex h-14 items-center rounded-sm border border-ds-gray-quaternary bg-ds-gray-primary text-left shadow"
    >
      <a
        className="flex h-full grow items-center font-semibold hover:bg-ds-gray-secondary"
        href={signIn.path({ to, provider, privateScope: true })}
        data-cy={'login-button'}
      >
        <img
          alt={`Logo of ${providerToName(provider)}`}
          className="mx-4 block h-6 w-6"
          src={providerImage(provider)}
        />
        Login with {providerToName(provider)}
      </a>
      {provider === 'gh' && (
        <div id="scope-dropdown" className="relative h-full">
          <button
            className="flex h-full w-12 items-center justify-center border-l border-ds-gray-quaternary hover:bg-ds-gray-secondary"
            aria-haspopup="listbox"
            aria-expanded={toggle}
            onClick={() => setToggle((toggle) => !toggle)}
          >
            <Icon name="chevron-down" />
          </button>
          <ul
            className={cs(
              ' min-w-[10rem] right-0 bg-ds-gray-primary border border-ds-gray-quaternary rounded-sm absolute z-10  shadow-md ring-1 ring-black ring-opacity-5 focus:outline-none',
              { hidden: !toggle }
            )}
          >
            <li>
              <a
                className="block px-4 pb-1 pt-2 hover:bg-ds-gray-secondary hover:text-ds-gray-octonary"
                href={signIn.path({ to, provider, privateScope: true })}
              >
                All repos
              </a>
            </li>
            <li>
              <a
                className="block px-4 pb-2 pt-1 hover:bg-ds-gray-secondary hover:text-ds-gray-octonary"
                href={signIn.path({ to, provider })}
              >
                Public repos only
              </a>
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
