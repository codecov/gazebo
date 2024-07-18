import config from 'config'

import { CodecovIcon } from 'assets/svg/codecov'
import A from 'ui/A'

import { FooterItem } from './FooterItem'

function Footer() {
  const year = new Date().getUTCFullYear()
  const version = config.IS_SELF_HOSTED
    ? [{ text: config?.CODECOV_VERSION }]
    : []

  // const leftMenu = [
  //   { text: `© ${year} Sentry` },
  //   ...buildModeLeftMenu,
  //   { to: { pageName: 'terms' } },
  //   { to: { pageName: 'privacy' } },
  //   { to: { pageName: 'security' } },
  //   { to: { pageName: 'gdpr' } },
  // ]

  const pricing = config.IS_SELF_HOSTED
    ? [{ to: { pageName: 'selfHostedLicensing' } }]
    : [{ to: { pageName: 'pricing' } }]

  // const rightMenu = [
  //   ...buildModeRightMenu,
  //   { to: { pageName: 'support' } },
  //   { to: { pageName: 'docs' } },
  //   { to: { pageName: 'feedback' } },
  // ]

  const middleMenu = [
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
      <nav className="container flex flex-col flex-wrap items-center justify-center border-t border-ds-gray-tertiary px-3 py-6 text-white sm:justify-between lg:flex-row">
        <ul className="flex flex-1 items-center justify-center gap-4">
          <A to={{ pageName: 'owner' }}>
            <CodecovIcon
              className="mr-2 cursor-pointer text-ds-gray-quinary"
              fillColor="#68737e"
            />
          </A>
          {middleMenu.map((props, i) => (
            <FooterItem key={`footer-left-${i}`} {...props} />
          ))}
        </ul>
      </nav>
    </footer>
  )
}

export default Footer
