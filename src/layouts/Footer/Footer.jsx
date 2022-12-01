import config from 'config'

import { ReactComponent as CodecovIcon } from 'assets/svg/codecov.svg'
import { useUser } from 'services/user'
import A from 'ui/A'

import { FooterItem } from './FooterItem'

function Footer() {
  const { data: currentUser } = useUser({
    suspense: false,
  })

  const year = new Date().getUTCFullYear()
  const version = config.IS_SELF_HOSTED
    ? [{ text: config?.CODECOV_VERSION }]
    : []
  const leftMenu = [
    { text: `© ${year} Codecov` },
    ...version,
    { to: { pageName: 'terms' } },
    { to: { pageName: 'privacy' } },
    { to: { pageName: 'security' } },
    { to: { pageName: 'gdpr' } },
  ]

  const pricing = !config.IS_SELF_HOSTED
    ? [{ to: { pageName: 'pricing' } }]
    : []
  const rightMenu = [
    ...pricing,
    { to: { pageName: 'support' } },
    { to: { pageName: 'docs' } },
    { to: { pageName: 'enterprise' } },
  ]

  if (!!currentUser) {
    rightMenu.push({ to: { pageName: 'feedback' } })
  }

  return (
    <footer className="flex-none">
      <nav className="container flex flex-wrap flex-col lg:flex-row justify-center sm:justify-between text-white py-6 px-3 items-center border-t border-ds-gray-tertiary">
        <ul className="flex-1 flex justify-center gap-4 lg:justify-start items-center">
          {leftMenu.map((props, i) => (
            <FooterItem key={`footer-left-${i}`} {...props} />
          ))}
        </ul>
        <A to={{ pageName: 'provider' }}>
          <CodecovIcon className="text-ds-gray-quinary mr-2 cursor-pointer" />
        </A>
        <ul className="flex-1 flex justify-center gap-4 lg:justify-end items-center">
          {rightMenu.map((props, i) => (
            <FooterItem key={`footer-right-${i}`} {...props} />
          ))}
        </ul>
      </nav>
    </footer>
  )
}

export default Footer
