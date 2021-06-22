import PropTypes from 'prop-types'

import AppLink from 'shared/AppLink'

const styles = {
  nav: 'lg:w-56 mb-4 border border-ds-gray-tertiary rounded text-ds-gray-quinary overflow-hidden divide-y devide-ds-gray-tertiary',
  link: 'block p-3 hover:bg-ds-gray-quaternary hover:bg-opacity-5',
  activeLink:
    'border-l-4 pl-2 border-ds-gray-octonary text-ds-gray-octonary font-semibold bg-ds-gray-quaternary bg-opacity-5',
}

function Sidemenu({ links }) {
  return (
    <nav className={styles.nav}>
      {links.map((tab) => (
        // need an extra div to have the border to separate links from the
        // active left border with a different color
        <div key={tab.pageName}>
          <AppLink
            {...tab}
            className={styles.link}
            activeClassName={styles.activeLink}
          />
        </div>
      ))}
    </nav>
  )
}

Sidemenu.propTypes = {
  links: PropTypes.arrayOf(PropTypes.shape(AppLink.propTypes)).isRequired,
}

export default Sidemenu
