import PropTypes from 'prop-types'

import { useUser } from 'services/user'

import NameEmailCard from './NameEmailCard'
import StudentCard from './StudentCard'
import ManageAdminCard from './ManageAdminCard'
import GithubIntegrationCard from './GithubIntegrationCard'
import DeletionCard from './DeletionCard'
import { useRedirectToBilling } from './hooks'

function Admin({ provider, owner }) {
  useRedirectToBilling()

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
