import Sidemenu from 'ui/Sidemenu'

function AdminSettingsSidebar() {
  return (
    <div>
      <Sidemenu
        links={[
          { pageName: 'access', children: 'Access' },
          { pageName: 'users', children: 'Users' },
        ]}
      />
    </div>
  )
}

export default AdminSettingsSidebar
