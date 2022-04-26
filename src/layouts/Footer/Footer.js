import { ReactComponent as CodecovIcon } from 'assets/svg/codecov.svg'
import { useStaticNavLinks } from 'services/navigation'
import A from 'ui/A'

import { FooterItem } from './FooterItem'

function Footer() {
  const { terms, privacy, security, gdpr, pricing, support, docs, enterprise } =
    useStaticNavLinks()

  const year = new Date().getFullYear()
  const leftMenu = [
    { text: `© ${year} Codecov` },
    terms,
    privacy,
    security,
    gdpr,
  ]
  const rightMenu = [pricing, support, docs, enterprise]
  return (
    <footer className="flex-none">
      <nav className="container flex flex-wrap flex-col lg:flex-row justify-center sm:justify-between text-white py-6 px-3 items-center border-t border-ds-gray-tertiary">
        <ul className="flex-1 flex justify-center lg:justify-start items-center">
          {leftMenu.map((data, i) => (
            <FooterItem key={`footer-left-${i}`} {...data} />
          ))}
        </ul>
        <A to={{ pageName: 'provider' }}>
          <CodecovIcon className="text-ds-gray-quinary mr-2 cursor-pointer" />
        </A>
        <ul className="flex-1 flex justify-center lg:justify-end items-center">
          {rightMenu.map((data, i) => (
            <FooterItem key={`footer-right-${i}`} {...data} />
          ))}
        </ul>
      </nav>
    </footer>
  )
}

export default Footer
