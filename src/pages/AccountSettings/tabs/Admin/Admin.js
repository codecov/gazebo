import PropTypes from 'prop-types'

import { useUser } from 'services/user'

import NameEmailCard from './NameEmailCard'
import StudentCard from './StudentCard'
import GithubIntegrationCard from './GithubIntegrationCard'

function Admin({ isPersonalSettings, provider, owner }) {
  const { data: user } = useUser({ provider })
  return (
    <div>
      {isPersonalSettings ? (
        <>
          <NameEmailCard user={user} provider={provider} />
          <StudentCard user={user} />
        </>
      ) : (
        'add/remove admin section'
      )}
      <div className="mt-8">
        <GithubIntegrationCard provider={provider} owner={owner} />
      </div>
    </div>
  )
}

Admin.propTypes = {
  isPersonalSettings: PropTypes.bool.isRequired,
  provider: PropTypes.string.isRequired,
  owner: PropTypes.string.isRequired,
}

export default Admin
