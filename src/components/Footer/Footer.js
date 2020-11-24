import Icon from '../Icon'
import PropType from 'prop-types'

function FooterLink({ label, to }) {
  return (
    <li classNames="flex justify-center">
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

FooterLink.propTypes = {
  label: PropType.string.isRequired,
  to: PropType.string,
}

function Footer() {
  const leftMenu = [
    { label: '© 2019 Codecov' },
    { label: 'Terms', to: '/' },
    { label: 'Privacy', to: '/' },
    { label: 'Security', to: '/' },
    { label: 'GDPR', to: '/' },
  ]
  const rightMenu = [
    { label: 'Shop', to: '/' },
    { label: 'Pricing', to: '/' },
    { label: 'Support', to: '/' },
    { label: 'Docs', to: '/' },
    { label: 'Enterprise', to: '/' },
  ]
  return (
    <footer className="flex-none bg-codecov-footer">
      <div className="container flex flex-col sm:flex-row justify-center sm:justify-between text-white py-6 px-3">
        <ul className="flex-1 flex justify-center sm:justify-start items-center">
          {leftMenu.map((data, i) => (
            <FooterLink key={i} {...data} />
          ))}
        </ul>
        <Icon
          className="flex-none p-4 self-center justify-self-center"
          color="text-pink-500"
          name="codecov"
        />
        <ul className="flex-1 flex justify-center sm:justify-end items-center">
          {rightMenu.map((data, i) => (
            <FooterLink key={i} {...data} />
          ))}
        </ul>
      </div>
    </footer>
  )
}

export default Footer
