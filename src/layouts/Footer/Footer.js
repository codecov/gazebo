import { useStaticNavLinks } from 'services/navigation'
import { FooterItem } from './FooterItem'
import { ReactComponent as CodecovIcon } from 'assets/svg/codecov.svg'

function Footer() {
  const {
    terms,
    privacy,
    security,
    gdpr,
    pricing,
    support,
    docs,
    enterprise,
  } = useStaticNavLinks()

  const leftMenu = [{ text: '© 2021 Codecov' }, terms, privacy, security, gdpr]
  const rightMenu = [pricing, support, docs, enterprise]
  return (
    <footer className="flex-none bg-codecov-footer">
      <nav className="container flex flex-wrap flex-col lg:flex-row justify-center sm:justify-between text-white py-6 px-3 items-center">
        <ul className="flex-1 flex justify-center lg:justify-start items-center">
          {leftMenu.map((data, i) => (
            <FooterItem key={`footer-left-${i}`} {...data} />
          ))}
        </ul>
        <CodecovIcon className="text-pink-500 mr-2" />
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
