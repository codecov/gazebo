import PropTypes from 'prop-types'

import { useUser } from 'services/user'

import NameEmailCard from './NameEmailCard'
import StudentCard from './StudentCard'

function Admin({ isPersonalSettings, provider }) {
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
    </div>
  )
}

Admin.propTypes = {
  isPersonalSettings: PropTypes.bool.isRequired,
  provider: PropTypes.string.isRequired,
}

export default Admin
