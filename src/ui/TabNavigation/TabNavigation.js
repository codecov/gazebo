import PropTypes from 'prop-types'

import AppLink from 'shared/AppLink'

const styles = {
  link: 'px-5 py-2 border-b-2 border-transparent hover:border-ds-gray-quinary text-ds-gray-quinary',
  activeLink:
    'text-ds-gray-octonary border-b-2 border-ds-gray-octonary font-semibold',
}

function TabNavigation({ tabs }) {
  return (
    <nav className="border-b border-ds-gray-tertiary flex">
      {tabs.map((tab) => (
        <AppLink
          {...tab}
          className={styles.link}
          activeClassName={styles.activeLink}
          key={tab.pageName}
        />
      ))}
      {/* {user.plan === "users-free" &&
        <div>
          { user.planUserCount === 0 && 
            <h2>Looks like you're up to 5 users.<a> Upgrade</a> plan today!</h2>
          }
          { user.planUserCount < 5 &&
            <h2>Need more than 5 users? <a> Request</a> free trial</h2>
          }
        </div>
      } */}
    </nav>
  )
}

TabNavigation.propTypes = {
  tabs: PropTypes.arrayOf(PropTypes.shape(AppLink.propTypes)).isRequired,
}

export default TabNavigation
