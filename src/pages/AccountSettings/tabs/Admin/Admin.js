import PropTypes from 'prop-types'

import NameEmailCard from './NameEmailCard'

function Admin({ isPersonalSettings }) {
  return (
    <div>
      {isPersonalSettings ? <NameEmailCard /> : 'add/remove admin section'}
    </div>
  )
}

Admin.propTypes = {
  isPersonalSettings: PropTypes.bool.isRequired,
}

export default Admin
