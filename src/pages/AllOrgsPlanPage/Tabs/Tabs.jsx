import TabNavigation from 'ui/TabNavigation'

function Tabs() {
  const tabs = [
    {
      pageName: 'provider',
      children: 'Repos',
    },
    { pageName: 'allOrgsPlanPage' },
  ]

  return <TabNavigation tabs={tabs} />
}

export default Tabs
