import Sidemenu from 'ui/Sidemenu'

function SideMenuSettings() {
  return (
    <div>
      <Sidemenu
        links={[
          {
            pageName: 'settingsGeneral',
            exact: true,
          },
          {
            pageName: 'settingsYaml',
          },
          { pageName: 'settingsBadge' },
        ]}
      />
    </div>
  )
}

export default SideMenuSettings
