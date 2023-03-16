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
  const buildModeLeftMenu = config.IS_SELF_HOSTED
    ? [{ text: config?.CODECOV_VERSION }]
    : []

  const leftMenu = [
    { text: `© ${year} Sentry` },
    ...buildModeLeftMenu,
    { to: { pageName: 'terms' } },
    { to: { pageName: 'privacy' } },
    { to: { pageName: 'security' } },
    { to: { pageName: 'gdpr' } },
  ]

  const buildModeRightMenu = config.IS_SELF_HOSTED
    ? [{ to: { pageName: 'selfHostedLicensing' } }]
    : [{ to: { pageName: 'pricing' } }]

  const rightMenu = [
    ...buildModeRightMenu,
    { to: { pageName: 'support' } },
    { to: { pageName: 'docs' } },
  ]

  if (!!currentUser) {
    rightMenu.push({ to: { pageName: 'feedback' } })
  }

  return (
    <footer className="flex-none">
      <nav className="container flex flex-col flex-wrap items-center justify-center border-t border-ds-gray-tertiary py-6 px-3 text-white sm:justify-between lg:flex-row">
        <ul className="flex flex-1 items-center justify-center gap-4 lg:justify-start">
          {leftMenu.map((props, i) => (
            <FooterItem key={`footer-left-${i}`} {...props} />
          ))}
        </ul>
        <A to={{ pageName: 'provider' }}>
          <CodecovIcon className="mr-2 cursor-pointer text-ds-gray-quinary" />
        </A>
        <ul className="flex flex-1 items-center justify-center gap-4 lg:justify-end">
          {rightMenu.map((props, i) => (
            <FooterItem key={`footer-right-${i}`} {...props} />
          ))}
        </ul>
      </nav>
    </footer>
  )
}

export default Footer
