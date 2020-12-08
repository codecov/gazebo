import Icon from '../Icon'
import PropType from 'prop-types'

export function FooterItem({ label, to }) {
  return (
    <li className="flex justify-center">
      {to ? (
        <a
          className="p-4 no-underline hover:underline hover:text-blue-400"
          href={to}
        >
          {label}
        </a>
      ) : (
        label
      )}
    </li>
  )
}

FooterItem.propTypes = {
  label: PropType.string.isRequired,
  to: PropType.string,
}

function Footer() {
  const leftMenu = [
    { label: '© 2019 Codecov' },
    { label: 'Terms', to: '/terms' },
    { label: 'Privacy', to: '/privacy' },
    { label: 'Security', to: '/security' },
    { label: 'GDPR', to: '/gdpr' },
  ]
  const rightMenu = [
    // { label: 'Shop', to: '/' },
    { label: 'Pricing', to: '/pricing' },
    { label: 'Support', to: '/support' },
    { label: 'Docs', to: 'https://docs.codecov.io/' },
    { label: 'Enterprise', to: '/enterprise' },
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
