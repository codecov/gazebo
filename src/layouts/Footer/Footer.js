import { ReactComponent as CodecovIcon } from 'assets/svg/codecov.svg'
import A from 'ui/A'

import { FooterItem } from './FooterItem'

function Footer() {
  const year = new Date().getUTCFullYear()
  const leftMenu = [
    { text: `© ${year} Codecov` },
    { to: { pageName: 'terms' } },
    { to: { pageName: 'privacy' } },
    { to: { pageName: 'security' } },
    { to: { pageName: 'gdpr' } },
  ]
  const rightMenu = [
    { to: { pageName: 'pricing' } },
    { to: { pageName: 'support' } },
    { to: { pageName: 'docs' } },
    { to: { pageName: 'enterprise' } },
  ]
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
