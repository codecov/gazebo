import PropTypes from 'prop-types'

import MyContextSwitcher from 'layouts/MyContextSwitcher'

function Header({ owner }) {
  return (
    <MyContextSwitcher pageName="analytics" activeContext={owner.username} />
  )
}

Header.propTypes = {
  owner: PropTypes.shape({
    username: PropTypes.string.isRequired,
  }).isRequired,
}

export default Header
