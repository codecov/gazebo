import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'

function SideMenu({ baseUrl }) {
  return (
    <div>
      <Link to={baseUrl}>Billing & Users</Link>
      <br />
      <Link to={baseUrl + 'yaml'}>YAML</Link>
      <br />
      <Link to={baseUrl + 'admin'}>Admin</Link>
    </div>
  )
}

SideMenu.propTypes = {
  baseUrl: PropTypes.string.isRequired,
}

export default SideMenu
