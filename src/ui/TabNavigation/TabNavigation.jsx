import PropTypes from 'prop-types'

import AppLink from 'shared/AppLink'

const styles = {
  link: 'mr-5 py-2 hover:border-b-4 hover:border-ds-gray-quinary text-ds-gray-quinary',
  activeLink:
    '!text-ds-gray-octonary border-b-4 !border-ds-gray-octonary font-semibold',
}

function TabNavigation({ tabs, component }) {
  return (
    <div className="mx-4 flex flex-wrap justify-between overflow-auto border-b border-ds-gray-tertiary sm:mx-0">
      <nav className="flex">
        {tabs.map((tab) => (
          <AppLink
            {...tab}
            className={styles.link}
            activeClassName={styles.activeLink}
            key={tab.pageName}
          />
        ))}
      </nav>
      {component || null}
    </div>
  )
}

TabNavigation.propTypes = {
  tabs: PropTypes.arrayOf(PropTypes.shape(AppLink.propTypes)).isRequired,
  component: PropTypes.node,
}

export default TabNavigation
