import Icon from 'ui/Icon'
import PropType from 'prop-types'

import { appLinks } from 'shared/router'

export function FooterItem({ text, path }) {
  return (
    <li className="flex justify-center">
      {path ? (
        <a
          className="p-4 no-underline hover:underline hover:text-blue-400"
          href={path}
        >
          {text}
        </a>
      ) : (
        text
      )}
    </li>
  )
}

FooterItem.propTypes = {
  text: PropType.string.isRequired,
  path: PropType.string,
}

function Footer() {
  const leftMenu = [
    { text: '© 2021 Codecov' },
    appLinks.terms,
    appLinks.privacy,
    appLinks.security,
    appLinks.gdpr,
  ]
  const rightMenu = [
    // appLinks.shop,
    appLinks.pricing,
    appLinks.support,
    appLinks.docs,
    appLinks.enterprise,
  ]
  return (
    <footer className="flex-none bg-codecov-footer">
      <nav className="container flex flex-wrap flex-col lg:flex-row justify-center sm:justify-between text-white py-6 px-3">
        <ul className="flex-1 flex justify-center lg:justify-start items-center">
          {leftMenu.map((data, i) => (
            <FooterItem key={`footer-left-${i}`} {...data} />
          ))}
        </ul>
        <Icon
          className="flex-none p-4 self-center justify-self-center"
          color="text-pink-500"
          name="codecov"
        />
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
