import AppLink from 'ui/AppLink'

const tabs = [
  { pageName: 'owner', text: 'Repos' },
  { pageName: 'accountAdmin', text: 'Settings' },
]

const styles = {
  link: 'px-5 py-2 text-sm',
  activeLink: 'border-b-2 border-gray-500 font-semibold',
}

function TabNavigation() {
  return (
    <div className="container mx-auto">
      <nav className="border-b border-gray-200 flex">
        {tabs.map((tab) => (
          <AppLink
            {...tab}
            className={styles.link}
            activeClassName={styles.activeLink}
            key={tabs.pageName}
          />
        ))}
      </nav>
    </div>
  )
}

export default TabNavigation
