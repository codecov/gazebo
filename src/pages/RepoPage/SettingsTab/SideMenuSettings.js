import Sidemenu from 'ui/Sidemenu'

function SideMenuSettings() {
  return (
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
  )
}

export default SideMenuSettings
