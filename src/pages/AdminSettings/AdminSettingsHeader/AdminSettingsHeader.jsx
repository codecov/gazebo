import { useUser } from 'services/user'
import Breadcrumb from 'ui/Breadcrumb'

function AdminSettingsHeader() {
  const { data: currentUser } = useUser()
  const defaultOrg =
    currentUser?.owner?.defaultOrgUsername ?? currentUser?.user?.username

  return (
    <div className="my-4">
      <Breadcrumb
        paths={[
          {
            pageName: 'owner',
            text: defaultOrg,
            options: { owner: defaultOrg },
          },
          { pageName: '', readOnly: true, text: 'Admin' },
        ]}
      />
    </div>
  )
}

export default AdminSettingsHeader
