import PropTypes from 'prop-types'

import { useUser } from 'services/user'

import NameEmailCard from './NameEmailCard'
import StudentCard from './StudentCard'

function Admin({ isPersonalSettings }) {
  const { data: user } = useUser()
  return (
    <div>
      {isPersonalSettings ? (
        <>
          <NameEmailCard user={user} />
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
}

export default Admin
