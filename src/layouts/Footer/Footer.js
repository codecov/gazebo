import { useStaticNavLinks } from 'services/navigation'
import { FooterItem } from './FooterItem'
import { ReactComponent as CodecovIcon } from 'assets/svg/codecov.svg'

function Footer() {
  const { terms, privacy, security, gdpr, pricing, support, docs, enterprise } =
    useStaticNavLinks()

  const leftMenu = [
    { text: '© 2021 Codecov', classes: 'text-ds-gray-quinary' },
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
          {leftMenu.map((data, i) => {
            data.classes = data.classes || 'text-ds-blue-darker'
            return <FooterItem key={`footer-left-${i}`} {...data} />
          })}
        </ul>
        <CodecovIcon className="text-ds-gray-quinary mr-2 cursor-pointer" />
        <ul className="flex-1 flex justify-center lg:justify-end items-center">
          {rightMenu.map((data, i) => {
            data.classes = data.classes || 'text-ds-blue-darker'
            return <FooterItem key={`footer-right-${i}`} {...data} />
          })}
        </ul>
      </nav>
    </footer>
  )
}

export default Footer
