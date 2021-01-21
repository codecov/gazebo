import PropTypes from 'prop-types'

import NameEmailCard from './NameEmailCard'
import StudentCard from './StudentCard'

function Admin({ isPersonalSettings }) {
  return (
    <div>
      {isPersonalSettings ? (
        <>
          <NameEmailCard />
          <StudentCard />
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
