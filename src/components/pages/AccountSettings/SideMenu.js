import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'

function SideMenu({ baseUrl }) {
  return (
    <aside>
      <section>
        <Link to={baseUrl}>Billing & Users</Link>
        <br />
        <Link to={baseUrl + 'yaml'}>YAML</Link>
        <br />
        <Link to={baseUrl + 'admin'}>Admin</Link>
      </section>
    </aside>
  )
}

SideMenu.propTypes = {
  baseUrl: PropTypes.string.isRequired,
}

export default SideMenu
