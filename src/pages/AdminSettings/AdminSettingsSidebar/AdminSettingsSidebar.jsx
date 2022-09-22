import Sidemenu from 'ui/Sidemenu'

function AdminSettingsSidebar() {
  return (
    <Sidemenu
      links={[
        { pageName: 'access', children: 'Access' },
        { pageName: 'users', children: 'Users' },
      ]}
    />
  )
}

export default AdminSettingsSidebar
