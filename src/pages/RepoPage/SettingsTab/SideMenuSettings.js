import Sidemenu from 'ui/Sidemenu'

function SideMenuSettings() {
  return (
    <div>
      <Sidemenu
        links={[
          {
            pageName: 'general',
            exact: true,
          },
          {
            pageName: 'repoYaml',
          },
          { pageName: 'badge' },
        ]}
      />
    </div>
  )
}

export default SideMenuSettings
