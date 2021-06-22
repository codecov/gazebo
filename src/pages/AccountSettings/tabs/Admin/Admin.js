import PropTypes from 'prop-types'

import { useUser } from 'services/user'

import NameEmailCard from './NameEmailCard'
import StudentCard from './StudentCard'
import ManageAdminCard from './ManageAdminCard'
import GithubIntegrationCard from './GithubIntegrationCard'
import DeletionCard from './DeletionCard'

function Admin({ provider, owner }) {
  const { data: user } = useUser({ provider })
  const isPersonalSettings = user.username.toLowerCase() === owner.toLowerCase()

  return (
    <div>
      {isPersonalSettings ? (
        <>
          <NameEmailCard user={user} provider={provider} />
          <StudentCard user={user} />
        </>
      ) : (
        <ManageAdminCard />
      )}
      <div className="mt-8 flex flex-col md:flex-row">
        <GithubIntegrationCard provider={provider} owner={owner} />
        <div className="flex-grow mt-8 md:mt-0">
          <DeletionCard
            provider={provider}
            owner={owner}
            isPersonalSettings={isPersonalSettings}
          />
        </div>
      </div>
    </div>
  )
}

Admin.propTypes = {
  provider: PropTypes.string.isRequired,
  owner: PropTypes.string.isRequired,
}
export default Admin
