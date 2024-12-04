import AppLink from 'shared/AppLink'

interface TabNavigationProps {
  // TODO: will need AppLink to be typed first - should be array of AppLinkProps
  tabs: any[]
  component?: React.ReactNode
}

function TabNavigation({ tabs, component }: TabNavigationProps) {
  return (
    <div className="mx-0 flex flex-col-reverse justify-between gap-2 border-b border-ds-gray-tertiary @md/commit-detail-page:!flex-col-reverse @4xl/commit-detail-page:!flex-row md:flex-col xl:flex-row">
      <nav className="flex overflow-auto">
        {tabs.map((tab) => (
          <AppLink
            {...tab}
            className="mr-5 whitespace-nowrap py-2 text-ds-gray-quinary hover:border-b-4 hover:border-ds-gray-quinary"
            activeClassName="!text-ds-gray-octonary border-b-4 !border-ds-gray-octonary font-semibold"
            key={tab.pageName}
          />
        ))}
      </nav>
      {component || null}
    </div>
  )
}

export default TabNavigation
