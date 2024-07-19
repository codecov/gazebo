import config from 'config'

import { CodecovIcon } from 'assets/svg/codecov'
import A from 'ui/A'

import { FooterItem } from './FooterItem'

function Footer() {
  const year = new Date().getUTCFullYear()

  const version =
    config.IS_SELF_HOSTED && config.CODECOV_VERSION
      ? [{ text: config.CODECOV_VERSION }]
      : []

  const pricing = config.IS_SELF_HOSTED ? [] : [{ to: { pageName: 'pricing' } }]

  const menu = [
    { text: `© ${year} Sentry` },
    ...version,
    { to: { pageName: 'terms' } },
    { to: { pageName: 'privacy' } },
    { to: { pageName: 'security' } },
    { to: { pageName: 'gdpr' } },
    ...pricing,
  ]

  return (
    <footer className="flex-none">
      <nav className="container flex items-center justify-center border-t border-ds-gray-tertiary px-3 py-6 text-white">
        <ul className="flex flex-1 items-center justify-center gap-4">
          <A to={{ pageName: 'owner' }} hook={undefined} isExternal={false}>
            <CodecovIcon fillColor="#68737e" />
          </A>
          {menu.map((props, i) => (
            <FooterItem key={`footer-${i}`} {...props} />
          ))}
        </ul>
      </nav>
    </footer>
  )
}

export default Footer
