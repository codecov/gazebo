import { useUser } from 'services/user'
import { useFlags } from 'shared/featureFlags'
import Breadcrumb from 'ui/Breadcrumb'

function AdminSettingsHeader() {
  const { data: currentUser } = useUser()
  const defaultOrg =
    currentUser?.owner?.defaultOrgUsername ?? currentUser?.user?.username

  const { newHeader } = useFlags({
    newHeader: false,
  })

  if (newHeader) {
    return null
  }

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
