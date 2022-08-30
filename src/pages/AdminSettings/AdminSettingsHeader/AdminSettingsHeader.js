import { useParams } from 'react-router-dom'

import Breadcrumb from 'ui/Breadcrumb'

function AdminSettingsHeader() {
  const { owner } = useParams()

  let link = { pageName: 'provider', text: 'All orgs and repos' }

  if (owner && owner !== 'access' && owner !== 'users') {
    link = { pageName: 'owner', text: owner }
  }

  return (
    <div className="mb-8">
      <Breadcrumb
        paths={[link, { pageName: '', readOnly: true, text: 'Admin' }]}
      />
    </div>
  )
}

export default AdminSettingsHeader
