import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'

function SideMenu({ baseUrl }) {
  return (
    <div>
      <Link to={baseUrl}>General</Link>
      <br />
      <Link to={baseUrl + 'billing'}>Billing</Link>
      <br />
      <Link to={baseUrl + 'users'}>Users</Link>
      <br />
      <Link to={baseUrl + 'invoices'}>Invoices</Link>
      <br />
      <Link to={baseUrl + 'yaml'}>Yaml</Link>
      <br />
      <Link to={baseUrl + 'yaml/history'}>Yaml history</Link>
      <br />
    </div>
  )
}

SideMenu.propTypes = {
  baseUrl: PropTypes.string.isRequired,
}

export default SideMenu
