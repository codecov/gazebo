import config from 'config'

import { CodecovIcon } from 'assets/svg/codecov'
import A from 'ui/A'

import { FooterItem } from './FooterItem'

function Footer() {
  const year = new Date().getUTCFullYear()

  const leftMenu = [{ text: `© ${year} Sentry` }]

  const buildModeRightMenu = config.IS_SELF_HOSTED
    ? [{ text: config?.CODECOV_VERSION }]
    : []

  const rightMenu = [...buildModeRightMenu]

  return (
    <footer className="flex-none bg-black">
      <nav className="container flex flex-col flex-wrap items-center justify-center px-3 py-6 text-white sm:justify-between lg:flex-row">
        <ul className="flex flex-1 items-center justify-center gap-4 lg:justify-start">
          {leftMenu.map((props, i) => (
            <FooterItem key={`footer-left-${i}`} {...props} />
          ))}
        </ul>
        <A to={{ pageName: 'owner' }} hook={undefined} isExternal={false}>
          <CodecovIcon />
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
