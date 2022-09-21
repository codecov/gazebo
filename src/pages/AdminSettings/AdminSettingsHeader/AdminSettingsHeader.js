import Breadcrumb from 'ui/Breadcrumb'

function AdminSettingsHeader() {
  return (
    <div className="mb-8">
      <Breadcrumb
        paths={[
          { pageName: 'provider', text: 'All orgs and repos' },
          { pageName: '', readOnly: true, text: 'Admin' },
        ]}
      />
    </div>
  )
}

export default AdminSettingsHeader
