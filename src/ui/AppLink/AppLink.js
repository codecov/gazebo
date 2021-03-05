import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'

function AppLink({ Component = Link, useRouter = true, children, ...props }) {
  if (!useRouter) {
    return <a {...props}>{children}</a>
  }
  return <Component {...props}>{children}</Component>
}

AppLink.propTypes = {
  useRouter: PropTypes.bool,
  Component: PropTypes.elementType,
}

export default AppLink
