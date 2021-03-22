import PropTypes from 'prop-types'

import AppLink from 'ui/AppLink'

const styles = {
  link: 'px-5 py-2 text-sm',
  activeLink: 'border-b-2 border-gray-500 font-semibold',
}

function TabNavigation({ tabs }) {
  return (
    <nav className="border-b border-gray-200 flex">
      {tabs.map((tab) => (
        <AppLink
          {...tab}
          className={styles.link}
          activeClassName={styles.activeLink}
          key={tab.pageName}
        />
      ))}
    </nav>
  )
}

TabNavigation.propTypes = {
  tabs: PropTypes.arrayOf(PropTypes.shape(AppLink.propTypes)).isRequired,
}

export default TabNavigation
