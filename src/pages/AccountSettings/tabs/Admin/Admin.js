import PropTypes from 'prop-types'

import { useUser } from 'services/user'

import DeletionCard from './DeletionCard'
import GithubIntegrationCard from './GithubIntegrationCard'
import ManageAdminCard from './ManageAdminCard'
import NameEmailCard from './NameEmailCard'
import StudentCard from './StudentCard'

function Admin({ provider, owner }) {
  const { data: currentUser } = useUser({ provider })
  const isPersonalSettings =
    currentUser.user.username.toLowerCase() === owner.toLowerCase()

  return (
    <div>
      {isPersonalSettings ? (
        <>
          <NameEmailCard currentUser={currentUser} provider={provider} />
          <StudentCard currentUser={currentUser} />
        </>
      ) : (
        <ManageAdminCard />
      )}
      <div className="mt-8 flex flex-col md:flex-row">
        <GithubIntegrationCard provider={provider} owner={owner} />
        <div className="grow mt-8 md:mt-0">
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
